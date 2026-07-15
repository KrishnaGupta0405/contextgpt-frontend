"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { faqCategories } from "./faqData";
import FAQAccordion from "./FAQAccordion";

export default function FAQSection() { 
  return (
    <section className="py-16">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
          Have a different question and can't find the answer you're looking
          for? Reach out to our{" "}
          <a
            href="mailto:support@contextgpt.in"
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            support team
          </a>{" "}
          and we'll get back to you as soon as we can.
        </p>
      </div>

      <Tabs defaultValue={faqCategories[0].value}>
        <div className="mb-8 w-full h-12 overflow-x-auto overflow-y-hidden">
          <TabsList
            variant="line"
            className="flex h-12 min-w-max mx-auto flex-nowrap gap-1 bg-transparent p-0 justify-center items-center"
          >
            {faqCategories.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="flex-none rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-lg font-medium text-gray-500 shadow-none after:opacity-0! data-[state=active]:border-b-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none dark:text-gray-400 dark:data-[state=active]:border-blue-400 dark:data-[state=active]:text-blue-400"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {faqCategories.map((cat) => (
          <TabsContent key={cat.value} value={cat.value}>
            <FAQAccordion items={cat.items} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
