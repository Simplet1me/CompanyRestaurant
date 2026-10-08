package com.simplet1me.companyrestaurant.service;

import com.simplet1me.companyrestaurant.common.PageResult;
import com.simplet1me.companyrestaurant.entity.Menu;
import com.simplet1me.companyrestaurant.model.dto.MenuCreateDTO;
import com.simplet1me.companyrestaurant.model.vo.MenuVO;

import java.math.BigDecimal;
import java.util.List;

/**
 * 菜单管理服务（餐厅经理）
 */
public interface MenuService {

    PageResult<Menu> pageList(int pageNum, int pageSize);

    /** 当前使用中菜单（含菜品），无使用中菜单时返回 null */
    MenuVO current();

    MenuVO getDetail(Long id);

    /** 创建菜单：菜品从食谱快照复制，旧使用中菜单自动转历史，新菜单即启用 */
    MenuVO create(MenuCreateDTO dto);

    /** 向菜单添加菜品（快照复制，已存在的菜品跳过） */
    MenuVO addItems(Long menuId, List<Long> recipeIds);

    /** 修改菜单菜品价格（不影响食谱） */
    void updateItemPrice(Long itemId, BigDecimal price);

    /** 删除菜单菜品 */
    void deleteItem(Long itemId);

    /** 删除菜单（使用中的菜单不可删除） */
    void deleteMenu(Long id);

    /** 启用菜单（更换/复用历史菜单，旧使用中菜单自动转历史） */
    MenuVO activate(Long id);
}
