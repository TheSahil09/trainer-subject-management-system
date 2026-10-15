package com.nexanova.trainer_subject_app.scheduling.controller;

import com.nexanova.trainer_subject_app.scheduling.entity.User;
import com.nexanova.trainer_subject_app.scheduling.repository.UserRepository;
import com.nexanova.trainer_subject_app.scheduling.util.PasswordUtil;
import org.apache.poi.ss.usermodel.*;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentBulkUploadController {

    private final UserRepository userRepository;
    private final PasswordUtil passwordUtil;

    public StudentBulkUploadController(UserRepository userRepository, PasswordUtil passwordUtil) {
        this.userRepository = userRepository;
        this.passwordUtil = passwordUtil;
    }

    @PostMapping(value = "/bulk-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> bulkUpload(@RequestParam("file") MultipartFile file,
                                        HttpServletRequest request) {
        try {
            String callerRole = (String) request.getAttribute("userRole");
            if (callerRole == null || !callerRole.equalsIgnoreCase("ADMIN")) {
                return ResponseEntity.status(403).body(Map.of("message", "Only ADMIN can upload students"));
            }

            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Uploaded file is empty"));
            }

            String fileName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
            List<RowData> rows;

            if (fileName.endsWith(".csv")) {
                rows = parseCsv(file);
            } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
                rows = parseExcel(file);
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Unsupported file type. Use CSV or Excel."));
            }

            int created = 0;
            int skipped = 0;
            List<String> errors = new ArrayList<>();

            for (int index = 0; index < rows.size(); index++) {
                RowData row = rows.get(index);
                int lineNo = index + 2;

                if (isBlank(row.name) || isBlank(row.email)) {
                    skipped++;
                    errors.add("Row " + lineNo + ": missing name or email");
                    continue;
                }

                if (userRepository.findByEmail(row.email).isPresent()) {
                    skipped++;
                    errors.add("Row " + lineNo + ": email already exists (" + row.email + ")");
                    continue;
                }

                User user = new User();
                user.setName(row.name.trim());
                user.setEmail(row.email.trim().toLowerCase());
                user.setRole(User.Role.STUDENT);
                String rawPassword = isBlank(row.password) ? "Pass1234" : row.password.trim();
                user.setPassword(passwordUtil.hash(rawPassword));
                userRepository.save(user);
                created++;
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Bulk upload completed");
            response.put("count", created);
            response.put("created", created);
            response.put("skipped", skipped);
            response.put("errors", errors);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "message", "Failed to upload students",
                    "details", e.getMessage()
            ));
        }
    }

    private List<RowData> parseCsv(MultipartFile file) throws IOException {
        List<RowData> rows = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) return rows;

            List<String> header = splitCsv(headerLine);
            Map<String, Integer> index = buildHeaderIndex(header);

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                List<String> cells = splitCsv(line);
                rows.add(extractRow(cells, index));
            }
        }

        return rows;
    }

    private List<RowData> parseExcel(MultipartFile file) throws IOException {
        List<RowData> rows = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getNumberOfSheets() > 0 ? workbook.getSheetAt(0) : null;
            if (sheet == null) return rows;

            DataFormatter formatter = new DataFormatter();
            Row headerRow = sheet.getRow(sheet.getFirstRowNum());
            if (headerRow == null) return rows;

            List<String> header = new ArrayList<>();
            int headerCells = Math.max(headerRow.getLastCellNum(), 0);
            for (int i = 0; i < headerCells; i++) {
                header.add(formatter.formatCellValue(headerRow.getCell(i)));
            }
            Map<String, Integer> index = buildHeaderIndex(header);

            for (int r = sheet.getFirstRowNum() + 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;

                List<String> cells = new ArrayList<>();
                int lastCell = Math.max(row.getLastCellNum(), 0);
                for (int c = 0; c < Math.max(lastCell, header.size()); c++) {
                    cells.add(formatter.formatCellValue(row.getCell(c)));
                }

                boolean allEmpty = cells.stream().allMatch(value -> value == null || value.trim().isEmpty());
                if (allEmpty) continue;

                rows.add(extractRow(cells, index));
            }
        }

        return rows;
    }

    private Map<String, Integer> buildHeaderIndex(List<String> header) {
        Map<String, Integer> index = new HashMap<>();
        for (int i = 0; i < header.size(); i++) {
            String key = normalize(header.get(i));
            if (!key.isEmpty()) index.put(key, i);
        }
        return index;
    }

    private RowData extractRow(List<String> cells, Map<String, Integer> index) {
        String name = value(cells, firstExisting(index, "name", "studentname", "full name", "full_name", "student name"));
        String email = value(cells, firstExisting(index, "email", "emailaddress", "email address"));
        String password = value(cells, firstExisting(index, "password", "pass", "temporary password", "temporary_password"));

        if (isBlank(name) || isBlank(email)) {
            int namePos = looksNumeric(value(cells, 0)) ? 1 : 0;
            int emailPos = looksNumeric(value(cells, 0)) ? 2 : 1;
            name = isBlank(name) ? value(cells, namePos) : name;
            email = isBlank(email) ? value(cells, emailPos) : email;
        }

        return new RowData(name, email, password);
    }

    private List<String> splitCsv(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean quoted = false;

        for (int i = 0; i < line.length(); i++) {
            char ch = line.charAt(i);
            if (ch == '"') {
                quoted = !quoted;
            } else if (ch == ',' && !quoted) {
                result.add(current.toString().trim());
                current.setLength(0);
            } else {
                current.append(ch);
            }
        }

        result.add(current.toString().trim());
        return result;
    }

    private Integer firstExisting(Map<String, Integer> index, String... keys) {
        for (String key : keys) {
            Integer found = index.get(normalize(key));
            if (found != null) return found;
        }
        return null;
    }

    private String value(List<String> cells, Integer index) {
        if (index == null || index < 0 || index >= cells.size()) return "";
        return Optional.ofNullable(cells.get(index)).orElse("").trim();
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase().replace("_", "").replace("-", "").trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private boolean looksNumeric(String value) {
        return value != null && value.trim().matches("^\\d+$");
    }

    private static class RowData {
        private final String name;
        private final String email;
        private final String password;

        private RowData(String name, String email, String password) {
            this.name = name;
            this.email = email;
            this.password = password;
        }
    }
}
