#include <iostream>
#include <vector>
#include <string>

using namespace std;

class LibraryBook {
private:
    string author;
    string title;
    int copies;
    int readers;

public:
    LibraryBook(string a, string t, int c, int r) {
        author = a;
        title = t;
        copies = c;
        readers = r;
    }

    double getAvgQueue() const {
        return (copies > 0) ? (double)readers / copies : 0;
    }

    string getAuthor() const { return author; }
    string getTitle() const { return title; }
    int getReaders() const { return readers; }

    void print() const {
        cout << "Автор: " << author
             << ", Название: " << title
             << ", Экземпляров: " << copies
             << ", Читателей: " << readers
             << ", Ср. очередь: " << getAvgQueue() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<LibraryBook> books = {
        LibraryBook("Толстой Л.Н.", "Война и мир", 5, 20),
        LibraryBook("Достоевский Ф.М.", "Идиот", 3, 18),
        LibraryBook("Булгаков М.А.", "Мастер и Маргарита", 10, 50),
        LibraryBook("Тургенев И.С.", "Отцы и дети", 7, 12),
        LibraryBook("Чехов А.П.", "Вишнёвый сад", 4, 8)
    };

    cout << "Все книги:" << endl;
    for (const auto& b : books) {
        b.print();
    }

    int maxReaders = 0;
    int maxIdx = 0;
    for (int i = 0; i < books.size(); ++i) {
        if (books[i].getReaders() > maxReaders) {
            maxReaders = books[i].getReaders();
            maxIdx = i;
        }
    }

    cout << "\nНаиболее читаемая книга:" << endl;
    books[maxIdx].print();

    return 0;
}
