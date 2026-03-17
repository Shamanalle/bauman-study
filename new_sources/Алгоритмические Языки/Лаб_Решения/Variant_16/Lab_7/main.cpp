#include <iostream>
#include <thread>
#include <mutex>
#include <future>
#include <string>
#include <random>
#include <chrono>

using namespace std;

mutex cout_mtx;

void safePrint(const string& threadName, const string& item) {
    lock_guard<mutex> lock(cout_mtx);
    cout << "[" << threadName << "] Печать: " << item << endl;
}

void printFibonacci(int n) {
    long long a = 0, b = 1;
    for (int i = 0; i < n; ++i) {
        safePrint("Thread 1 (Fibonacci)", to_string(a));
        long long next = a + b;
        a = b;
        b = next;
        this_thread::sleep_for(chrono::milliseconds(20)); 
    }
}

void printNaturalNumbers(int n) {
    for (int i = 1; i <= n; ++i) {
        safePrint("Thread 2 (Natural)", to_string(i));
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
    
    int num_elements = 5; 

    cout << "1. Демонстрация работы с классами thread\n";

    thread t1(printFibonacci, num_elements);
    thread t2(printNaturalNumbers, num_elements);
    thread t3(printRandomNumbers, num_elements);

    t1.join();
    t2.join();
    t3.join();
    
    cout << "\nВсе потоки (thread) завершили работу.\n\n";

    cout << "\n2. Демонстрация работы через async и future\n";

    future<void> f1 = async(launch::async, printFibonacci, num_elements);
    future<void> f2 = async(launch::async, printNaturalNumbers, num_elements);
    future<void> f3 = async(launch::async, printRandomNumbers, num_elements);

    f1.wait();
    f2.wait();
    f3.wait();

    cout << "\nВсе асинхронные задачи (async) завершили работу." << endl;

    return 0;
}
