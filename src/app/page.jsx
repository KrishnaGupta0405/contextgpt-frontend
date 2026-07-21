// This is the root page of the app "/"
import NavigationMenuDemo from "@/components/navbar";
import Landing from "./(not-protected)/landing/page";
import Footer from "@/components/footer/Footer";
import ChatbotWidget from "@/components/chatbot-widget";
export default function Home() {
  return (
    <>
      <NavigationMenuDemo /> <Landing /> <Footer />
      <ChatbotWidget />
    </>
  );
}
