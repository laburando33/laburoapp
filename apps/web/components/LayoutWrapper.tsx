// components/LayoutWrapper.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Notifications from "@/components/Notifications";

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => (
  <>
    <Notifications />
    <Header />
    <main className="main-content">{children}</main>
    <Footer />
  </>
);

export default LayoutWrapper;
