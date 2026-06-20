export const responsiveBreakpoints = {
  tablet: 768,
  desktop: 1200,
};

export const responsiveLayoutClasses = {
  dashboardGrid: "grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 desktop:grid-cols-3 desktop:gap-6",
  inlineFilters: "hidden desktop:flex",
  drawerFilters: "hidden md:flex desktop:hidden",
  mobileBottomNav: "fixed inset-x-4 bottom-4 z-40 md:hidden",
  tableWrap: "overflow-x-auto rounded-lg",
  touchTarget: "min-h-[44px] min-w-[44px]",
};
