"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "@/app/api/axios";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  content: string;
  role: "user" | "assistant";
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Simulate AI response

    axios
      .request({
        url: "/chatbot",
        method: "POST",
        data: { message: userMessage },
      })
      .then((response) => {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.data.message },
        ]);
      });
    // setTimeout(() => {
    //   setMessages((prev) => [
    //     ...prev,
    //     {
    //       role: "assistant",
    //       content:
    //         "I'm a demo chatbot. I can showcase the UI, but I'm not connected to a real AI backend yet!",
    //     },
    //   ]);
    //   setIsLoading(false);
    // }, 1000);
  };

  return (
    <div>
      <div>
        <div className="pb-2  bg-white rounded-t-lg flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" />
          <h1 className="text-lg font-semibold">AI Assistant</h1>
        </div>
        <Card className="w-full  h-[80vh] flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user" ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-gray-700" />
                    )}
                  </div>
                  <Markdown
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                    // remarkPlugins={[remarkGfm]}
                  >
                    {message.content}
                  </Markdown>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce delay-100">●</span>
                      <span className="animate-bounce delay-200">●</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <form
            onSubmit={handleSubmit}
            className="p-4 border-t bg-white rounded-b-lg"
          >
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
