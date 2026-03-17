#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
#include <deque>
#include <list>

using namespace std;

class Student {
private:
    string name;
    string group;
    string recordBook;
    int grades[4];

public:
    Student() : name(""), group(""), recordBook("") { for(int i=0;i<4;i++) grades[i]=0; }

    Student(string n, string g, string rb, int g1, int g2, int g3, int g4)
        : name(move(n)), group(move(g)), recordBook(move(rb)) {
        grades[0]=g1; grades[1]=g2; grades[2]=g3; grades[3]=g4;
    }

    Student(const Student& other)
        : name(other.name), group(other.group), recordBook(other.recordBook) {
        for(int i=0;i<4;i++) grades[i]=other.grades[i];
     {}

    Student(Student&& other) noexcept
        : name(move(other.name)), group(move(other.group)),
          recordBook(move(other.recordBook)) {
        for(int i=0;i<4;i++) grades[i]=other.grades[i];
     {}

    Student& operator=(const Student& other) {
        if (this != &other) {
            name = other.name;
            group = other.group;
            recordBook = other.recordBook;
            for(int i=0;i<4;i++) grades[i]=other.grades[i];
        }
        return *this;
    }

    Student& operator=(Student&& other) noexcept {
        if (this != &other) {
            name = move(other.name);
            group = move(other.group);
            recordBook = move(other.recordBook);
            for(int i=0;i<4;i++) grades[i]=other.grades[i];
        }
        return *this;
    }

    string getName() const { return name; }
    double getAvgGrade() const {
        return (grades[0]+grades[1]+grades[2]+grades[3]) / 4.0;
    }

    friend ostream& operator<<(ostream& os, const Student& s) {
        os << "Студент: " << s.name << ", Группа: " << s.group
           << ", Зачётка: " << s.recordBook << ", Оценки: "
           << s.grades[0] << " " << s.grades[1] << " "
           << s.grades[2] << " " << s.grades[3]
           << ", Средний: " << s.getAvgGrade();
        return os;
    }

    friend istream& operator>>(istream& is, Student& s) {
        is >> s.name >> s.group >> s.recordBook
           >> s.grades[0] >> s.grades[1] >> s.grades[2] >> s.grades[3];
        return is;
    }
};

bool compareByName(const Student& a, const Student& b) {
    return a.getName() < b.getName();
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    deque<Student> items;
    Student temp;

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

    sort(items.begin(), items.end(), compareByName);

    fout << "\nОтсортированный контейнер (по ФИО):\n";
    cout << "\nОтсортированный контейнер (по ФИО):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    list<Student> copied(items.size());
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
