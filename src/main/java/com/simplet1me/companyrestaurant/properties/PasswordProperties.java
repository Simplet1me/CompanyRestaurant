package com.simplet1me.companyrestaurant.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 密码配置属性：加载 application-local.yml 中的 password 段（盐不入库，见 .gitignore）
 */
@Data
@Component
@ConfigurationProperties(prefix = "password")
public class PasswordProperties {

    /** SHA-256 加盐值 */
    private String salt;
}
