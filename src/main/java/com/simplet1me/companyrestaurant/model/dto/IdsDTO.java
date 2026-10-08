package com.simplet1me.companyrestaurant.model.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * 批量操作请求体（批量删除等）
 */
@Data
public class IdsDTO {

    @NotEmpty(message = "ids 不能为空")
    private List<Long> ids;
}
