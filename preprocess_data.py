import csv
import requests

class Coordinate():
    def __init__(self, latitude: float = None, longitude: float = None, crime_severity: dict = None):
        self.latitude = latitude
        self.longitude = longitude
        self.weightage = 0
        self.crime_severity = crime_severity

    def __str__(self):
        return f"Coordinate({self.latitude}, {self.longitude}, {self.crime_severity})"
    
    def get_latlong(self):
        return [self.latitude, self.longitude]
    
    def get_longlat(self):
        return [self.longitude, self.latitude]
    
    def get_crime_severity(self):
        return self.crime_severity
    
    def get_weight(self):
        crime_weights = {
            "outrage_of_modesty": 3,
            "theft_in_dwelling": 2,
            "voyeurism": 3,
            "shop_theft": 1,
            "rape": 5,
            "murder": 5,
            "littering": 1,
            "jaywalking": 1,
            "traffic_accident": 2,
            "pickpocketing": 2
        }
        
        weighted_sum = sum(int(self.crime_severity[crime]) * crime_weights[crime] for crime in crime_weights)
        self.weightage = weighted_sum
        return weighted_sum
        
class CoordinateGroup():
    def __init__(self, group=""):
        self.group = group
        self.data = self.read_data()

    def read_data(self):
        """
        Returns a list of Coordinates object
        """
        result = []
        with open(f"./data/{self.group}.csv", "r") as f:
            data = csv.DictReader(f, skipinitialspace=True)
            for entry in data:
                coordinate = Coordinate(latitude = float(entry["latitude"]),
                                        longitude = float(entry["longitude"]))
                del entry["latitude"]
                del entry["longitude"]
                # this is anti-pattern
                coordinate.crime_severity = entry
                result.append(coordinate)
        self.data = result
        return result
    
    def get_coordinates(self):
        return [coords.get_longlat() for coords in self.data]
    
    def get_normalized_weights(self):
        result = []
        # i should actually normalize across the whole map, but i cant be bothered
        weighted_sums = [coords.get_weight() for coords in self.data]
        min_sum = min(weighted_sums)
        max_sum = max(weighted_sums)

        normalized_values = [(value - min_sum) / (max_sum - min_sum)for value in weighted_sums]
        for coords, normalized_value in zip(self.data, normalized_values):
            # anti pattern again ahhh
            result.append((coords.latitude, coords.longitude, normalized_value))

        return result
    
    def get_route(self):
        """
        coordinates (list): an array of lat, long values
        """
        coordinates = ";".join(",".join(map(str, coordinate_pair)) for coordinate_pair in self.get_coordinates())
        print(coordinates)
        URL = f"http://router.project-osrm.org/trip/v1/driving/{coordinates}"
        PARAMS = {'roundtrip': "true",
                'geometries': 'geojson',
                'steps': 'true'}
        r = requests.get(url=URL, params=PARAMS)
        return r.json()
    