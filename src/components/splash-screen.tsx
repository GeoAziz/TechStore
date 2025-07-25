import Logo from "@/components/layout/logo";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <style jsx>{`
        .glitch-text {
          animation: glitch 1.5s linear infinite;
        }

        @keyframes glitch {
          0%, 20%, 22%, 25%, 53%, 55%, 100% {
            opacity: 1;
            transform: scaleX(1) scaleY(1);
          }
          21%, 54% {
            opacity: 0.8;
            transform: scaleX(1.05) scaleY(0.95) skewX(5deg);
          }
        }
        
        .line-animation {
          position: relative;
          display: inline-block;
          animation: reveal 2s forwards;
          opacity: 0;
        }

        .line-animation::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 0;
          height: 100%;
          background: hsl(var(--primary));
          animation: typing 2s steps(22) forwards;
        }

        @keyframes typing {
          from { width: 100% }
          to { width: 0 }
        }

        @keyframes reveal {
          from { opacity: 0 }
          to { opacity: 1 }
        }

        .fade-in {
          animation: fadeIn 2s ease-in-out forwards;
          opacity: 0;
          animation-delay: 2s;
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
      
      <div className="relative mb-8">
        <Logo className="h-12 w-auto glitch-text" />
        <div className="absolute -inset-2 border-2 border-primary/50 rounded-lg animate-pulse"></div>
      </div>
      
      <div className="font-code text-primary">
        <p className="line-animation">Protocol Initiated: Client Interface Link Activated</p>
      </div>

      <div className="absolute bottom-10 text-center text-muted-foreground fade-in">
        <p>Zizo_OrderVerse initializing...</p>
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden mt-2">
           <div className="w-full h-full bg-primary animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
