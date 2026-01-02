import random
import math

def calculate_distance_gps(lat1, lon1, lat2, lon2):
    """Calcule la distance entre deux points GPS (formule haversine)"""
    R = 6371  # Rayon de la Terre en km
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

class SimulatedAnnealing:
    def __init__(self, distance_matrix, initial_temp=1000, cooling_rate=0.95, min_temp=1, use_nearest_neighbor=True):
        self.distance_matrix = distance_matrix
        self.initial_temp = initial_temp
        self.cooling_rate = cooling_rate
        self.min_temp = min_temp
        self.use_nearest_neighbor = use_nearest_neighbor
    
    def calculate_distance(self, route):
        """Calcule la distance totale d'une route"""
        total_distance = 0
        for i in range(len(route)):
            from_city = route[i]
            to_city = route[(i + 1) % len(route)]
            total_distance += self.distance_matrix[from_city][to_city]
        return total_distance
    
    def swap_cities(self, route):
        """Échange deux villes aléatoirement"""
        new_route = route.copy()
        i, j = random.sample(range(len(route)), 2)
        new_route[i], new_route[j] = new_route[j], new_route[i]
        return new_route
    
    def random_initial(self, cities):
        """Génère une solution initiale aléatoire"""
        route = cities.copy()
        random.shuffle(route)
        return route
    
    def nearest_neighbor_initial(self, cities):
        """Génère une solution initiale avec descente locale (plus proche voisin)"""
        if not cities:
            return []
        start = random.choice(cities)
        route = [start]
        unvisited = set(cities) - {start}
        while unvisited:
            current = route[-1]
            next_city = min(unvisited, key=lambda city: self.distance_matrix[current][city])
            route.append(next_city)
            unvisited.remove(next_city)
        return route

    
    def solve(self, cities):
        """Résout le TSP avec recuit simulé"""
        # Choisir la méthode de solution initiale
        if self.use_nearest_neighbor:
            current_route = self.nearest_neighbor_initial(cities)
        else:
            current_route = self.random_initial(cities)
            
        current_distance = self.calculate_distance(current_route)
        
        best_route = current_route.copy()
        best_distance = current_distance
        
        temperature = self.initial_temp
        
        while temperature > self.min_temp:
            new_route = self.swap_cities(current_route)
            new_distance = self.calculate_distance(new_route)
            
            # Critère d'acceptation
            if new_distance < current_distance or random.random() < math.exp(-(new_distance - current_distance) / temperature):
                current_route = new_route
                current_distance = new_distance
                
                if current_distance < best_distance:
                    best_route = current_route.copy()
                    best_distance = current_distance
            
            temperature *= self.cooling_rate
        
        return best_route, best_distance