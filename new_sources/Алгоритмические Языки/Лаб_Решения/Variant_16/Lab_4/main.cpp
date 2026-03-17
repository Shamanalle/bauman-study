#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
#include <deque>
#include <list>

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

    Book(const Book& other)
        : author(other.author), title(other.title), publisher(other.publisher),
          year(other.year), pages(other.pages) {}

    Book(Book&& other) noexcept
        : author(move(other.author)), title(move(other.title)),
          publisher(move(other.publisher)), year(other.year), pages(other.pages) {}

    Book& operator=(const Book& other) {
        if (this != &other) {
            author = other.author;
            title = other.title;
            publisher = other.publisher;
            year = other.year;
            pages = other.pages;
        }
        return *this;
    }

    Book& operator=(Book&& other) noexcept {
        if (this != &other) {
            author = move(other.author);
            title = move(other.title);
            publisher = move(other.publisher);
            year = other.year;
            pages = other.pages;
        }
        return *this;
    }

    string getAuthor() const { return author; }
    string getTitle() const { return title; }

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

bool compareByTitle(const Book& a, const Book& b) {
    return a.getTitle() < b.getTitle();
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    deque<Book> items;
    Book temp;

    while (fin >> temp) {
        items.push_back(temp);
    }
    fin.close();

    ofstream fout("output.txt");

    fout << "Исходный контейнер (deque):\n";
    cout << "Исходный контейнер (deque):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    sort(items.begin(), items.end(), compareByTitle);

    fout << "\nОтсортированный контейнер (по названию):\n";
    cout << "\nОтсортированный контейнер (по названию):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    list<Book> copied(items.size());
    copy(items.begin(), items.end(), copied.begin());

    fout << "\nСкопированный контейнер (list):\n";
    cout << "\nСкопированный контейнер (list):\n";
    for (const auto& item : copied) {
        fout << item << "\n";
        cout << item << "\n";
    }

    fout.close();
    cout << "\nУспех! Результаты сохранены в файл output.txt" << endl;

    return 0;
}
