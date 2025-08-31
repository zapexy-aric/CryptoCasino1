import { useQuery } from "@tanstack/react-query";
import type { BigWin } from "@shared/schema";

export default function RecentWins() {
  const { data: bigWins, isLoading } = useQuery<BigWin[]>({
    queryKey: ["/api/big-wins"],
    retry: false,
  });

  if (isLoading) {
    return (
      <section className="bg-card rounded-xl p-4 sm:p-6 border border-border">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center">
            <i className="fas fa-trophy text-yellow-400 mr-2 sm:mr-3"></i>
            Recent Big Wins
          </h2>
        </div>
        <div className="text-center text-muted-foreground">Loading recent wins...</div>
      </section>
    );
  }

  if (!bigWins || bigWins.length === 0) {
    return (
      <section className="bg-card rounded-xl p-4 sm:p-6 border border-border">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center">
            <i className="fas fa-trophy text-yellow-400 mr-2 sm:mr-3"></i>
            Recent Big Wins
          </h2>
        </div>
        <div className="text-center text-muted-foreground">No recent big wins to display</div>
      </section>
    );
  }

  return (
    <section className="bg-card rounded-xl p-4 sm:p-6 border border-border">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center">
          <i className="fas fa-trophy text-yellow-400 mr-2 sm:mr-3"></i>
          Recent Big Wins
        </h2>
        <button className="text-primary hover:text-primary/80 text-sm" data-testid="button-view-all-wins">
          View All
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        {bigWins.slice(0, 6).map((win: any) => (
          <div key={win.id} className="bg-muted rounded-lg p-4 hover:bg-muted/80 transition-colors" data-testid={`card-win-${win.id}`}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-bomb text-primary"></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span className="font-medium" data-testid={`text-winner-${win.id}`}>
                    {win.user?.firstName || 'Anonymous'}
                  </span>
                </div>
                <p className="text-accent font-bold text-lg" data-testid={`text-amount-${win.id}`}>
                  ${parseFloat(win.winAmount).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground" data-testid={`text-game-${win.id}`}>
                  {win.gameType.charAt(0).toUpperCase() + win.gameType.slice(1)} Game
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
