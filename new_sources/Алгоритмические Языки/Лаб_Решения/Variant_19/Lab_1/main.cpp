#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

class StudentGPA {
private:
    string name;
    int grades[4];

public:
    StudentGPA(string n, int g1, int g2, int g3, int g4) {
        name = n;
        grades[0] = g1; grades[1] = g2;
        grades[2] = g3; grades[3] = g4;
    }

    double getAverage() const {
        return (grades[0] + grades[1] + grades[2] + grades[3]) / 4.0;
    }

    string getName() const { return name; }

    void print() const {
        cout << "ФИО: " << name << ", Оценки:";
        for (int i = 0; i < 4; ++i) cout << " " << grades[i];
        cout << ", Средний балл: " << getAverage() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<StudentGPA> students = {
        StudentGPA("Иванов И.И.", 5, 4, 5, 4),
        StudentGPA("Петров П.П.", 3, 4, 3, 4),
        StudentGPA("Сидоров С.С.", 5, 5, 5, 5),
        StudentGPA("Козлова А.В.", 4, 5, 4, 5),
        StudentGPA("Морозов Д.Е.", 4, 4, 4, 3)
    };

    cout << "Все студенты:" << endl;
    for (const auto& st : students) {
        st.print();
    }

    sort(students.begin(), students.end(),
         [](const StudentGPA& a, const StudentGPA& b) {
             return a.getAverage() > b.getAverage();
         });

    cout << "\nТоп-3 студента:" << endl;
    for (int i = 0; i < 3 && i < students.size(); ++i) {
        students[i].print();
    }

    return 0;
}
