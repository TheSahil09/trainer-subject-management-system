// package com.nexanova.trainer_subject_app.scheduling;

// import com.nexanova.trainer_subject_app.scheduling.util.JwtUtil;
// import jakarta.servlet.FilterChain;
// import jakarta.servlet.ServletException;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Component;
// import org.springframework.web.filter.OncePerRequestFilter;

// import java.io.IOException;

// import java.util.Collections;
// import java.util.List;

// import org.springframework.security.core.authority.SimpleGrantedAuthority;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;


// @Component
// public class JwtAuthenticationFilter extends OncePerRequestFilter {

//     @Autowired private JwtUtil jwtUtil;

// //    @Override
// //    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
// //                                    FilterChain filterChain) throws ServletException, IOException {
// //
// //        String header = request.getHeader("Authorization");
// //        if (header != null && header.startsWith("Bearer ")) {
// //            String token = header.substring(7);
// //            if (jwtUtil.isValid(token)) {
// //                String email = jwtUtil.extractEmail(token);
// //                String role = jwtUtil.extractRole(token);
// //
// ////                request.setAttribute("userRole", jwtUtil.extractRole(token));
// ////                request.setAttribute("userEmail", jwtUtil.extractEmail(token));
// //
// //                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
// //                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(email, null, Collections.singletonList(authority));
// //                SecurityContextHolder.getContext().setAuthentication(auth);
// //
// //                request.setAttribute("userRole", role);
// //                request.setAttribute("userEmail", email);
// //
// //            }
// //        }
// //        filterChain.doFilter(request, response);
// //   }

// @Override
// protected void doFilterInternal(HttpServletRequest request,
//                                 HttpServletResponse response,
//                                 FilterChain filterChain)
//         throws ServletException, IOException {

//     String header = request.getHeader("Authorization");

//     // 1️⃣ If no token → allow request (public APIs)
//     if (header == null || !header.startsWith("Bearer ")) {
//         filterChain.doFilter(request, response);
//         return;
//     }

//     // 2️⃣ Extract token
//     String token = header.substring(7);

//     // 3️⃣ Validate token
//     if (jwtUtil.isValid(token)) {

//         String email = jwtUtil.extractEmail(token);
//         String role = jwtUtil.extractRole(token);

//         // 4️⃣ Tell Spring Security: user is authenticated
//         UsernamePasswordAuthenticationToken authentication =
//                 new UsernamePasswordAuthenticationToken(
//                         email,
//                         null,
//                         List.of(new SimpleGrantedAuthority("ROLE_" + role))
//                 );

//         SecurityContextHolder.getContext().setAuthentication(authentication);
//     }

//     // 5️⃣ Continue request
//     filterChain.doFilter(request, response);
// }


// }


package com.nexanova.trainer_subject_app.scheduling;

import com.nexanova.trainer_subject_app.scheduling.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        // 🔓 Allow public APIs
        if (header == null || !header.startsWith("Bearer ")) {
            System.out.println("🔒 No Authorization header present or not Bearer (path=" + request.getRequestURI() + ")");
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7).trim();

        if (token.startsWith("\"") && token.endsWith("\"") && token.length() > 1) {
            token = token.substring(1, token.length() - 1).trim();
        }

        if (token.isBlank()) {
            System.out.println("❌ JWT AUTH FAILED - empty bearer token");
            filterChain.doFilter(request, response);
            return;
        }

        if (jwtUtil.isValid(token)) {

            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractRole(token);
            String normalizedRole = role != null && role.startsWith("ROLE_")
                ? role.substring("ROLE_".length())
                : role;

            // ✅ Spring Security authentication
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + normalizedRole))
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // ✅ REQUIRED by your controllers
            request.setAttribute("userEmail", email);
            request.setAttribute("userRole", normalizedRole);

            System.out.println("✅ JWT AUTH OK | Email: " + email + " | Role: " + normalizedRole);
        } else {
            System.out.println("❌ JWT AUTH FAILED - token invalid or expired (path=" + request.getRequestURI() + ")");
        }

        filterChain.doFilter(request, response);
    }
}
