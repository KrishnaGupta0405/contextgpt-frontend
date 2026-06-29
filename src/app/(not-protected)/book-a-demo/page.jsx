"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export default function BookDemo() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({"namespace":"demo"});
      cal("ui", {"theme":"light","cssVarsPerTheme":{"light":{"cal-brand":"#155ded"},"dark":{"cal-brand":"#fafafa"}},"hideEventTypeDetails":false,"layout":"month_view"});
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4">
      <div className="text-center mb-10">
        <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">
          Book a Demo
        </p>
        <h1 className="text-5xl font-black text-gray-900 mb-4">
          See ContextGPT in action
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Reserve a time slot below, then complete the form to tell us a bit
          more about yourself. We look forward to showing how ContextGPT can help
          your business.
        </p>
      </div>

      {/* <div className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-white"> */}
        <Cal
          namespace="demo"
          calLink="krishna-gupta-yjiqcs/demo"
          style={{ width: "100%", height: "100%", overflow: "scroll" }}
          config={{
            layout: "month_view",
            useSlotsViewOnSmallScreen: "true",
            theme: "light",
          }}
        />
      {/* </div> */}

      <p className="mt-8 text-gray-500 text-sm text-center">
        Have any questions?{" "}
        <a href="#" className="underline hover:text-gray-700">
          Ask our chatbot
        </a>{" "}
        or reach out to our support team by sending{" "}
        <strong>support@contextgpt.in</strong> an email and we&apos;ll get back to
        you as soon as we can.
      </p>
    </div>
  );
}
