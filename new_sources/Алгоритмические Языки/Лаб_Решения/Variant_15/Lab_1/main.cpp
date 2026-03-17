#include <iostream>
#include <vector>
#include <string>

using namespace std;

class Sentence {
private:
    vector<string> words;

public:
    Sentence(vector<string> w) {
        words = w;
    }

    int countLongWords() const {
        int count = 0;
        for (const auto& w : words) {
            if (w.length() > 5) count++;
        }
        return count;
    }

    int getWordCount() const { return words.size(); }

    void print() const {
        cout << "Предложение (" << words.size() << " слов):";
        for (const auto& w : words) cout << " " << w;
        cout << ", Слов > 5 букв: " << countLongWords() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Sentence> sentences = {
        Sentence({"Программирование", "это", "искусство", "создания", "алгоритмов"}),
        Sentence({"Кот", "сел", "на", "мат"}),
        Sentence({"Университет", "проводит", "олимпиаду", "по", "математике"}),
        Sentence({"Дом", "стоит", "у", "реки"}),
        Sentence({"Информационная", "безопасность", "важна", "для", "организации"})
    };

    cout << "Все предложения:" << endl;
    for (const auto& s : sentences) {
        s.print();
    }

    int totalWords = 0;
    int totalLong = 0;
    for (const auto& s : sentences) {
        totalWords += s.getWordCount();
        totalLong += s.countLongWords();
    }

    double percent = (totalWords > 0) ? (100.0 * totalLong / totalWords) : 0;
    cout << "\nВсего слов: " << totalWords << endl;
    cout << "Слов длиннее 5 букв: " << totalLong << endl;
    cout << "Процент длинных слов: " << percent << "%" << endl;

    return 0;
}
