import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Smoothly scrolls to top of the document on route change.
 * Mount once near the top of the app, inside <BrowserRouter>.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use instant scroll on mobile to avoid jank during page transitions
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
