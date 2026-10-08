package com.simplet1me.companyrestaurant.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户管理视图（不含密码）
 */
@Data
public class UserVO {

    private Long id;

    private String name;

    private String loginName;

    private String role;

    private String phone;

    private String department;

    private String workstation;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
}
