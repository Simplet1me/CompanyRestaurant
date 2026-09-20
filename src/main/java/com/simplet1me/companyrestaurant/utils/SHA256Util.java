package com.simplet1me.companyrestaurant.utils;

import com.simplet1me.companyrestaurant.properties.PasswordProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * 密码工具：SHA-256(盐 + 明文) 散列，盐值来自 PasswordProperties（application-local.yml）
 */
@Component
@RequiredArgsConstructor
public class SHA256Util {

    private final PasswordProperties passwordProperties;

    /**
     * 加密：SHA-256(盐 + 明文)，输出 64 位十六进制串
     */
    public String encode(String rawPassword) {
        return sha256Hex(passwordProperties.getSalt() + rawPassword);
    }

    /**
     * 校验：对明文重新散列后与密文比较
     */
    public boolean matches(String rawPassword, String encodedPassword) {
        return encode(rawPassword).equals(encodedPassword);
    }

    private String sha256Hex(String text) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(text.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            // JDK 必然提供 SHA-256，此处不会发生
            throw new IllegalStateException("SHA-256 算法不可用", e);
        }
    }
}
