#include <iostream>
#include <fstream>
#include <string>
#include <set>
#include <unordered_set>

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

    const string& getName() const { return name; }
    const string& getGroup() const { return group; }
    const string& getRecordBook() const { return recordBook; }
    double getAvgGrade() const {
        return (grades[0]+grades[1]+grades[2]+grades[3]) / 4.0;
    }

    bool operator<(const Student& other) const {
        double avg1 = getAvgGrade();
        double avg2 = other.getAvgGrade();
        if (avg1 != avg2) return avg1 < avg2;
        return name < other.name;
    }

    bool operator==(const Student& other) const {
        return (name == other.name &&
                group == other.group &&
                recordBook == other.recordBook &&
                grades[0]==other.grades[0] && grades[1]==other.grades[1] &&
                grades[2]==other.grades[2] && grades[3]==other.grades[3]);
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

namespace std {
    template<>
    struct hash<Student> {
        size_t operator()(const Student& obj) const {
            size_t h1 = hash<string>()(obj.getName());
            size_t h2 = hash<string>()(obj.getRecordBook());
            return h1 ^ (h2 << 1);
        }
    };
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    set<Student> orderedSet;
    unordered_set<Student> hashSet;
    
    Student tempObj;

    while (fin >> tempObj) {
        orderedSet.insert(tempObj); 
        hashSet.insert(tempObj);    
    }
    fin.close();

    cout << "Дерево set (Сортировка по среднему баллу):\n";
    for (const auto& item : orderedSet) {
        cout << item << endl;
    }

    cout << "\nХэш-таблица unordered_set (Без порядка):\n";
    for (const auto& item : hashSet) {
        cout << item << endl;
    }

    return 0;
}
