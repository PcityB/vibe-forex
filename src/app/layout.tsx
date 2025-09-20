import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Forex Pattern Mining Dashboard",
  description: "Machine Learning Dashboard for Forex Price Pattern Mining - Algorithmic Framework for Frequent Intraday Pattern Recognition",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900`}>
        <div className="min-h-screen">
          <header className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">FM</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Forex Pattern Mining</h1>
                    <p className="text-purple-300 text-sm">ML Dashboard for Algorithmic Pattern Recognition</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-sm">
                    Research Based
                  </div>
                  <div className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-400 text-sm">
                    Kaggle Powered
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          <main className="container mx-auto px-6 py-8">
            {children}
          </main>
          
          <footer className="bg-black/10 backdrop-blur-sm border-t border-purple-500/20 mt-16">
            <div className="container mx-auto px-6 py-6">
              <div className="flex items-center justify-between text-sm text-purple-300">
                <p>
                  Based on research: &ldquo;An Algorithmic Framework for Frequent Intraday Pattern Recognition and Exploitation in Forex Market&rdquo;
                </p>
                <div className="flex items-center space-x-4">
                  <span>Powered by Kaggle API</span>
                  <span>•</span>
                  <span>Real-time Pattern Analysis</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}