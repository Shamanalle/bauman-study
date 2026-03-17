#include <iostream>
#include <vector>
#include <string>

using namespace std;

class Book {
private:
    string author;
    string title;
    int pages;

public:
    Book(string a, string t, int p) {
        author = a;
        title = t;
        pages = p;
    }

    string getAuthor() const { return author; }
    string getTitle() const { return title; }
    int getPages() const { return pages; }

    void print() const {
        cout << "Автор: " << author
             << ", Название: " << title
             << ", Страниц: " << pages << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Book> books = {
        Book("Толстой Л.Н.", "Война и мир", 1225),
        Book("Достоевский Ф.М.", "Преступление и наказание", 672),
        Book("Булгаков М.А.", "Мастер и Маргарита", 480),
        Book("Пушкин А.С.", "Евгений Онегин", 224),
        Book("Гоголь Н.В.", "Мёртвые души", 352)
    };

    cout << "Все книги:" << endl;
    for (const auto& b : books) {
        b.print();
    }

    int maxPages = 0;
    int maxIdx = 0;
    for (int i = 0; i < books.size(); ++i) {
        if (books[i].getPages() > maxPages) {
            maxPages = books[i].getPages();
            maxIdx = i;
        }
    }

    cout << "\nКнига с максимальным количеством страниц:" << endl;
    books[maxIdx].print();

    return 0;
}
