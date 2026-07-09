import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-background selection:bg-primary/30">
            <Sidebar />
            <div className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
                <Header />
                {/* 
                  Main content area: Asymmetrical, wide padding.
                  We use max-w-[1600px] to keep it readable on ultra-wide screens,
                  and center it.
                */}
                <main className="flex-1 px-8 lg:px-12 py-8 overflow-y-auto w-full max-w-[1600px] mx-auto">
                    {children}
                </main>
            </div>
            
            {/* Subtle glow elements instead of bright blue/indigo blur */}
            <div className="fixed top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-0"></div>
            <div className="fixed bottom-[-10%] left-[15%] w-[30vw] h-[30vw] bg-accent/5 rounded-full blur-[100px] pointer-events-none -z-0"></div>
        </div>
    );
}
