package com.simplet1me.companyrestaurant.config;

import com.simplet1me.companyrestaurant.interceptor.LoginInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web 配置：拦截器注册 + 跨域（允许携带 Cookie）
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final LoginInterceptor loginInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor)
                .addPathPatterns("/api/**")
                // 登录、注册为公开接口，其余接口均需登录
                .excludePathPatterns("/api/auth/login", "/api/auth/register");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 前端另行开发，开发期放开跨域；携带 Cookie 时不能用 allowedOrigins("*")
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Content-Disposition")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
