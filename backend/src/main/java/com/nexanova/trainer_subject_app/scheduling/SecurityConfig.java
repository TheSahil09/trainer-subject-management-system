// package com.nexanova.trainer_subject_app.scheduling;

// //import com.nexanova.trainer_subject_app.scheduling.util.JwtUtil;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
// //import jakarta.servlet.FilterChain;
// //import jakarta.servlet.ServletException;
// //import jakarta.servlet.http.HttpServletRequest;
// //import jakarta.servlet.http.HttpServletResponse;
// //import java.io.IOException;
// //import org.springframework.web.filter.OncePerRequestFilter;

// @Configuration
// @EnableWebSecurity
// public class SecurityConfig {

//    @Autowired
//    //private JwtUtil jwtUtil;
//    private JwtAuthenticationFilter jwtAuthenticationFilter;

// //    @Bean
// //    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
// //        http.csrf(csrf -> csrf.disable())
// //                .authorizeHttpRequests(auth -> auth
// //                        // KEEP LOGIN PUBLIC
// //                        .requestMatchers("/api/auth/**", "/api/courses").permitAll()
// //                        // Student can enroll
// //                        .requestMatchers("/api/enrollments").hasRole("STUDENT")
// //                        // Schedule = Admin only (SRS compliant)
// //                        .requestMatchers("/api/schedule/**").hasRole("ADMIN")
// //                        .anyRequest().authenticated()
// //                )
// //                .addFilterBefore(new JwtAuthenticationFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class);
// //
// //        return http.build();
// //    }


// //    @Bean
// //    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
// //        http.csrf(csrf -> csrf.disable())
// //                .authorizeHttpRequests(auth -> auth
// //                        //.requestMatchers("/api/auth/**","/api/courses","/api/enrollments").permitAll() // added /api/enrollments
// //                        .requestMatchers("/api/auth/**", "/api/courses").permitAll()
// //                        .requestMatchers("/api/enrollments").hasRole("STUDENT")
// //                        .requestMatchers("/api/schedule/**").hasRole("ADMIN")  // ← NEW: Admin only
// //                        .anyRequest().authenticated()
// //                )
// //                .addFilterBefore(new JwtAuthenticationFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class);
// //
// //        return http.build();
// //    }


//     @Bean
//     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//         http.csrf(csrf -> csrf.disable())

//                 .cors(cors -> {})//next added

//                // .cors(cors -> cors.disable())  // DISABLE CORS CHECKS

//                 .authorizeHttpRequests(auth -> auth
//                         //.requestMatchers("/api/auth/**", "/api/courses", "/api/enrollments", "/api/schedule/**", "/api/trainer/**", "/api/subject/**" ).permitAll()  // ← ADD THIS

//                        // .requestMatchers("/api/**").permitAll()  // ALL APIs OPEN

//                         //.anyRequest().authenticated()
//                         .anyRequest().permitAll()
//                 );
//                // .addFilterBefore(new JwtAuthenticationFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class);
//                // .addFilterBefore(jwtAuthenticationFilter,UsernamePasswordAuthenticationFilter.class);


//         return http.build();
//     }




// //    public static class JwtAuthenticationFilter extends OncePerRequestFilter {
// //
// //        private final JwtUtil jwtUtil;
// //
// //        public JwtAuthenticationFilter(JwtUtil jwtUtil) {
// //            this.jwtUtil = jwtUtil;
// //        }
// //
// //        @Override
// //        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
// //                                        FilterChain filterChain) throws ServletException, IOException {
// //
// //            String header = request.getHeader("Authorization");
// //            if (header != null && header.startsWith("Bearer ")) {
// //                String token = header.substring(7);
// //                if (jwtUtil.isValid(token)) {
// //                    String email = jwtUtil.extractEmail(token);
// //                    String role = jwtUtil.extractRole(token);
// //                    request.setAttribute("userRole", role);
// //                    request.setAttribute("userEmail", email);
// //                }
// //            }
// //
// //            filterChain.doFilter(request, response);
// //        }
// //    }
// }


package com.nexanova.trainer_subject_app.scheduling;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})   // uses your CorsConfig
            .authorizeHttpRequests(auth -> auth
                    // 🔓 Public APIs
                    // .requestMatchers(
                            // "/api/auth/**",
                            // "/api/courses/**",
                            // "/api/modules/**"
                    // ).permitAll()

            // 🔓 Public APIs
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

            // Courses: allow public GETs, but restrict mutations to ADMIN
            .requestMatchers(HttpMethod.GET, "/api/courses/**").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/courses/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/courses/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/courses/**").hasRole("ADMIN")

            // Modules may be viewed by anyone, modifications require login
            .requestMatchers(HttpMethod.GET, "/api/modules/**").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/modules/**").authenticated()
            .requestMatchers(HttpMethod.PUT, "/api/modules/**").authenticated()
            .requestMatchers(HttpMethod.DELETE, "/api/modules/**").authenticated()

            // Schedules: only ADMIN may create/modify/delete slots
            .requestMatchers(HttpMethod.GET, "/api/schedules/student/**").hasAnyRole("STUDENT", "ADMIN")
            .requestMatchers(HttpMethod.GET, "/api/schedule/student/**").hasAnyRole("STUDENT", "ADMIN")
            .requestMatchers(HttpMethod.GET, "/api/schedules/**").authenticated()
            .requestMatchers(HttpMethod.GET, "/api/schedule/**").authenticated()
            .requestMatchers(HttpMethod.POST, "/api/schedules/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.POST, "/api/schedule/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/schedules/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/schedule/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/schedules/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/schedule/**").hasRole("ADMIN")

                    // 🔐 Everything else needs JWT
                    .anyRequest().authenticated()
            )

            // ✅ VERY IMPORTANT
            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
