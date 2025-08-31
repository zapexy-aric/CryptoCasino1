interface GameCategoriesProps {
  onMinesClick: () => void;
}

export default function GameCategories({ onMinesClick }: GameCategoriesProps) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
      <div className="bg-card rounded-xl p-4 sm:p-6 text-center hover:bg-card/80 transition-colors cursor-pointer group" data-testid="card-casino">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <i className="fas fa-dice text-xl sm:text-2xl text-white"></i>
        </div>
        <h3 className="font-bold text-base sm:text-lg">CASINO</h3>
        <p className="text-xs text-muted-foreground">In-house games & slots</p>
      </div>
      
      <div className="bg-card rounded-xl p-4 sm:p-6 text-center hover:bg-card/80 transition-colors cursor-pointer group" data-testid="card-sports">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 bg-gradient-to-br from-accent to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <i className="fas fa-football-ball text-xl sm:text-2xl text-white"></i>
        </div>
        <h3 className="font-bold text-base sm:text-lg">SPORTS</h3>
        <p className="text-xs text-muted-foreground">Football, Cricket, eSports</p>
      </div>
      
      <div className="bg-card rounded-xl p-4 sm:p-6 text-center hover:bg-card/80 transition-colors cursor-pointer group" data-testid="card-lottery">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <i className="fas fa-ticket-alt text-xl sm:text-2xl text-white"></i>
        </div>
        <h3 className="font-bold text-base sm:text-lg">LOTTERY</h3>
        <p className="text-xs text-muted-foreground">Global lottery draws</p>
      </div>
      
      <div className="bg-card rounded-xl p-4 sm:p-6 text-center hover:bg-card/80 transition-colors cursor-pointer group" data-testid="card-racing">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <i className="fas fa-car text-xl sm:text-2xl text-white"></i>
        </div>
        <h3 className="font-bold text-base sm:text-lg">RACING</h3>
        <p className="text-xs text-muted-foreground">Virtual racing</p>
      </div>
      
      <div className="bg-card rounded-xl p-4 sm:p-6 text-center hover:bg-card/80 transition-colors cursor-pointer group" data-testid="card-updown">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <i className="fas fa-chart-line text-xl sm:text-2xl text-white"></i>
        </div>
        <h3 className="font-bold text-base sm:text-lg">UPDOWN</h3>
        <p className="text-xs text-muted-foreground">Price prediction</p>
      </div>
      
      <div className="bg-card rounded-xl p-4 sm:p-6 text-center hover:bg-card/80 transition-colors cursor-pointer group" data-testid="card-bingo">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <i className="fas fa-trophy text-xl sm:text-2xl text-white"></i>
        </div>
        <h3 className="font-bold text-base sm:text-lg">BINGO</h3>
        <p className="text-xs text-muted-foreground">Live bingo games</p>
      </div>
    </section>
  );
}
