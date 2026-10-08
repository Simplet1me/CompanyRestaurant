package com.simplet1me.companyrestaurant.controller;

import com.simplet1me.companyrestaurant.annotation.RequireRole;
import com.simplet1me.companyrestaurant.common.PageResult;
import com.simplet1me.companyrestaurant.common.Result;
import com.simplet1me.companyrestaurant.entity.Menu;
import com.simplet1me.companyrestaurant.entity.Role;
import com.simplet1me.companyrestaurant.model.dto.MenuCreateDTO;
import com.simplet1me.companyrestaurant.model.dto.PriceDTO;
import com.simplet1me.companyrestaurant.model.dto.RecipeIdsDTO;
import com.simplet1me.companyrestaurant.model.vo.MenuVO;
import com.simplet1me.companyrestaurant.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 菜单管理接口（查看：登录即可；增删改与启用：餐厅经理）
 */
@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    /** 菜单列表（含历史，分页） */
    @GetMapping
    public Result<PageResult<Menu>> pageList(@RequestParam(defaultValue = "1") int pageNum,
                                             @RequestParam(defaultValue = "10") int pageSize) {
        return Result.success(menuService.pageList(pageNum, pageSize));
    }

    /** 当前使用中菜单（员工点餐用） */
    @GetMapping("/current")
    public Result<MenuVO> current() {
        return Result.success(menuService.current());
    }

    /** 创建菜单（创建即启用，旧使用中菜单自动转历史） */
    @PostMapping
    @RequireRole(Role.MANAGER)
    public Result<MenuVO> create(@Valid @RequestBody MenuCreateDTO dto) {
        return Result.success(menuService.create(dto));
    }

    /** 菜单详情（含菜品） */
    @GetMapping("/{id}")
    public Result<MenuVO> getDetail(@PathVariable Long id) {
        return Result.success(menuService.getDetail(id));
    }

    /** 向菜单添加菜品 */
    @PostMapping("/{id}/items")
    @RequireRole(Role.MANAGER)
    public Result<MenuVO> addItems(@PathVariable Long id, @Valid @RequestBody RecipeIdsDTO dto) {
        return Result.success(menuService.addItems(id, dto.getRecipeIds()));
    }

    /** 修改菜单菜品价格 */
    @PutMapping("/items/{itemId}/price")
    @RequireRole(Role.MANAGER)
    public Result<Void> updateItemPrice(@PathVariable Long itemId, @Valid @RequestBody PriceDTO dto) {
        menuService.updateItemPrice(itemId, dto.getPrice());
        return Result.success();
    }

    /** 删除菜单菜品 */
    @DeleteMapping("/items/{itemId}")
    @RequireRole(Role.MANAGER)
    public Result<Void> deleteItem(@PathVariable Long itemId) {
        menuService.deleteItem(itemId);
        return Result.success();
    }

    /** 删除菜单 */
    @DeleteMapping("/{id}")
    @RequireRole(Role.MANAGER)
    public Result<Void> deleteMenu(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return Result.success();
    }

    /** 启用菜单（更换/复用历史菜单） */
    @PutMapping("/{id}/activate")
    @RequireRole(Role.MANAGER)
    public Result<MenuVO> activate(@PathVariable Long id) {
        return Result.success(menuService.activate(id));
    }
}
