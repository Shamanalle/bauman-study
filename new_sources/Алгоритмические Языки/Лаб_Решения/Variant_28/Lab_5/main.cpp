#include <iostream>
#include <fstream>
#include <string>
#include <set>
#include <unordered_set>

using namespace std;

class Book {
private:
    string author;
    string title;
    string publisher;
    int year;
    int pages;

public:
    Book() : author(""), title(""), publisher(""), year(0), pages(0) {}

    Book(string a, string t, string p, int y, int pg)
        : author(move(a)), title(move(t)), publisher(move(p)), year(y), pages(pg) {}

    const string& getAuthor() const { return author; }
    const string& getTitle() const { return title; }
    const string& getPublisher() const { return publisher; }
    int getYear() const { return year; }
    int getPages() const { return pages; }

    bool operator<(const Book& other) const {
        if (author != other.author) return author < other.author;
        return title < other.title;
    }

    bool operator==(const Book& other) const {
        return (author == other.author &&
                title == other.title &&
                publisher == other.publisher &&
                year == other.year &&
                pages == other.pages);
    }

    friend ostream& operator<<(ostream& os, const Book& b) {
        os << "Книга: '" << b.title << "' автор: " << b.author
           << ", Изд-во: " << b.publisher << ", " << b.year
           << " г., " << b.pages << " стр.";
        return os;
    }

    friend istream& operator>>(istream& is, Book& b) {
        is >> b.author >> b.title >> b.publisher >> b.year >> b.pages;
        return is;
    }
};

namespace std {
    template<>
    struct hash<Book> {
        size_t operator()(const Book& obj) const {
            size_t h1 = hash<string>()(obj.getAuthor());
            size_t h2 = hash<string>()(obj.getTitle());
            return h1 ^ (h2 << 1);
        }
    };
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    set<Book> orderedSet;
    unordered_set<Book> hashSet;
    
    Book tempObj;

    while (fin >> tempObj) {
        orderedSet.insert(tempObj); 
        hashSet.insert(tempObj);    
    }
    fin.close();

    cout << "Дерево set (Сортировка по ФИО автора):\n";
    for (const auto& item : orderedSet) {
        cout << item << endl;
    }

    cout << "\nХэш-таблица unordered_set (Без порядка):\n";
    for (const auto& item : hashSet) {
        cout << item << endl;
    }

    return 0;
}
