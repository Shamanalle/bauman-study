#include <iostream>
#include <vector>
#include <string>

using namespace std;

class Product {
private:
    string name;
    int quantity;
    double price;

public:
    Product(string n, int q, double p) {
        name = n;
        quantity = q;
        price = p;
    }

    double getTotalCost() const {
        return quantity * price;
    }

    string getName() const { return name; }
    int getQuantity() const { return quantity; }
    double getPrice() const { return price; }

    void print() const {
        cout << "Товар: " << name
             << ", Кол-во: " << quantity
             << ", Цена: " << price
             << ", Сумма: " << getTotalCost() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Product> products = {
        Product("Молоко", 50, 89.90),
        Product("Хлеб", 100, 45.50),
        Product("Масло", 30, 120.00),
        Product("Сыр", 25, 350.00),
        Product("Яйца", 80, 99.90)
    };

    cout << "Все товары:" << endl;
    for (const auto& p : products) {
        p.print();
    }

    double totalCost = 0;
    for (const auto& p : products) {
        totalCost += p.getTotalCost();
    }
    cout << "\nСуммарная стоимость всех товаров: " << totalCost << endl;

    return 0;
}
