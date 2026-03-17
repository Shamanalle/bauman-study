#include <iostream>
#include <vector>

using namespace std;

class Rectangle {
private:
    double length;
    double width;

public:
    Rectangle(double l, double w) {
        length = l;
        width = w;
    }

    double getArea() const {
        return length * width;
    }

    double getLength() const { return length; }
    double getWidth() const { return width; }

    void print() const {
        cout << "Длина: " << length
             << ", Ширина: " << width
             << ", Площадь: " << getArea() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Rectangle> rects = {
        Rectangle(10.5, 5.0),
        Rectangle(3.0, 4.0),
        Rectangle(15.0, 8.0),
        Rectangle(7.5, 6.0),
        Rectangle(20.0, 12.0)
    };

    cout << "Все прямоугольники:" << endl;
    for (const auto& r : rects) {
        r.print();
    }

    double minArea;
    cout << "\nВведите минимальную площадь: ";
    cin >> minArea;

    cout << "\nПрямоугольники с площадью > " << minArea << ":" << endl;
    bool found = false;
    for (const auto& r : rects) {
        if (r.getArea() > minArea) {
            r.print();
            found = true;
        }
    }
    if (!found) {
        cout << "Таких прямоугольников не найдено." << endl;
    }

    return 0;
}
