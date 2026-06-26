# Popup Guidelines

The popup is the fastest status surface for FocusGate / 守界. It should answer the current page first: which rule group matches this host, whether it is blocked, upcoming, unlocked, outside schedule, or not listed, and which group will receive an added site.

Keep derived decision logic in `src/shared/`, especially `getPopupPageContext`, so Vitest can cover rule-group precedence and add-target behavior. The React entry point should only compose UI, call storage helpers, and route users to options or block-page previews.

Use Chinese for user-facing copy. Global product chrome should say `FocusGate / 守界`; “晚安边界” is only the default sleep rule group. Keep controls compact because popup width is fixed, and avoid adding complex form flows here.
