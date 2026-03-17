#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
#include <vector>
#include <deque>

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

bool compareByAvg(const Student& a, const Student& b) {
    return a.getAvgGrade() < b.getAvgGrade();
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    vector<Student> items;
    Student temp;

    while (fin >> temp) {
        items.push_back(temp);
    }
    fin.close();

    ofstream fout("output.txt");

    fout << "Исходный контейнер (vector):\n";
    cout << "Исходный контейнер (vector):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    sort(items.begin(), items.end(), compareByAvg);

    fout << "\nОтсортированный контейнер (по среднему баллу):\n";
    cout << "\nОтсортированный контейнер (по среднему баллу):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    deque<Student> copied(items.size());
    copy(items.begin(), items.end(), copied.begin());

    fout << "\nСкопированный контейнер (deque):\n";
    cout << "\nСкопированный контейнер (deque):\n";
    for (const auto& item : copied) {
        fout << item << "\n";
        cout << item << "\n";
    }

    fout.close();
    cout << "\nУспех! Результаты сохранены в файл output.txt" << endl;

    return 0;
}
