#include <iostream>
#include <vector>
#include <string>

using namespace std;

class ProductMarkup {
private:
    string name;
    int quantity;
    double purchasePrice;

public:
    ProductMarkup(string n, int q, double pp) {
        name = n;
        quantity = q;
        purchasePrice = pp;
    }

    double getRetailCost(double profitPercent) const {
        return quantity * purchasePrice * (1.0 + profitPercent / 100.0);
    }

    string getName() const { return name; }
    int getQuantity() const { return quantity; }
    double getPurchasePrice() const { return purchasePrice; }

    void print() const {
        cout << "Товар: " << name
             << ", Кол-во: " << quantity
             << ", Закупочная цена: " << purchasePrice << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<ProductMarkup> products = {
        ProductMarkup("Молоко", 50, 55.00),
        ProductMarkup("Хлеб", 100, 28.00),
        ProductMarkup("Масло", 30, 75.00),
        ProductMarkup("Сыр", 25, 220.00),
        ProductMarkup("Яйца", 80, 65.00)
    };

    cout << "Все товары:" << endl;
    for (const auto& p : products) {
        p.print();
    }

    double profitPercent;
    cout << "\nВведите процент прибыли: ";
    cin >> profitPercent;

    double totalCost = 0;
    cout << "\nСтоимость товаров с наценкой " << profitPercent << "%:" << endl;
    for (const auto& p : products) {
        double cost = p.getRetailCost(profitPercent);
        cout << p.getName() << ": " << cost << endl;
        totalCost += cost;
    }
    cout << "\nСуммарная стоимость: " << totalCost << endl;

    return 0;
}
