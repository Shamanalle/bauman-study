#include <iostream>
#include <thread>
#include <mutex>
#include <future>
#include <string>
#include <random>
#include <chrono>
#include <vector>
#include <sstream>
#include <iomanip>

using namespace std;

mutex cout_mtx;

void safePrint(const string& threadName, const string& item) {
    lock_guard<mutex> lock(cout_mtx);
    cout << "[" << threadName << "] " << item << endl;
}

void multiplyArrays(const vector<double>& a, const vector<double>& b, int n) {
    for (int i = 0; i < n; ++i) {
        ostringstream oss;
        oss << fixed << setprecision(2) << a[i] << " * " << b[i] << " = " << (a[i] * b[i]);
        safePrint("Thread 1 (Multiply)", oss.str());
        this_thread::sleep_for(chrono::milliseconds(20));
    }
}

void addArrays(const vector<double>& a, const vector<double>& b, int n) {
    for (int i = 0; i < n; ++i) {
        ostringstream oss;
        oss << fixed << setprecision(2) << a[i] << " + " << b[i] << " = " << (a[i] + b[i]);
        safePrint("Thread 2 (Add)", oss.str());
        this_thread::sleep_for(chrono::milliseconds(15));
    }
}

void printRandomNumbers(int n) {
    random_device rd;
    mt19937 gen(rd());
    uniform_int_distribution<> dis(1, 100);
    for (int i = 0; i < n; ++i) {
        safePrint("Thread 3 (Random)", to_string(dis(gen)));
        this_thread::sleep_for(chrono::milliseconds(25));
    }
}

int main() {
    setlocale(LC_ALL, "Russian");

    const int N = 5;
    random_device rd;
    mt19937 gen(rd());
    uniform_real_distribution<> dis(1.0, 50.0);

    vector<double> arr1(N), arr2(N);
    for (int i = 0; i < N; i++) { arr1[i] = dis(gen); arr2[i] = dis(gen); }

    cout << "1. Демонстрация работы с классами thread\n";

    thread t1(multiplyArrays, cref(arr1), cref(arr2), N);
    thread t2(addArrays, cref(arr1), cref(arr2), N);
    thread t3(printRandomNumbers, N);

    t1.join(); t2.join(); t3.join();
    cout << "\nВсе потоки (thread) завершили работу.\n\n";

    cout << "\n2. Демонстрация работы через async и future\n";

    auto f1 = async(launch::async, multiplyArrays, cref(arr1), cref(arr2), N);
    auto f2 = async(launch::async, addArrays, cref(arr1), cref(arr2), N);
    auto f3 = async(launch::async, printRandomNumbers, N);

    f1.wait(); f2.wait(); f3.wait();
    cout << "\nВсе асинхронные задачи (async) завершили работу." << endl;

    return 0;
}
