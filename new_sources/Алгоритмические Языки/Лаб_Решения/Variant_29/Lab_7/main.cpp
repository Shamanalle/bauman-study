#include <iostream>
#include <thread>
#include <mutex>
#include <future>
#include <string>
#include <random>
#include <chrono>
#include <vector>

using namespace std;

mutex cout_mtx;

void safePrint(const string& threadName, const string& item) {
    lock_guard<mutex> lock(cout_mtx);
    cout << "[" << threadName << "] " << item << endl;
}

void bubbleSort(vector<double>& arr, int left, int right, const string& name) {
    for (int i = left; i < right - 1; ++i) {
        for (int j = left; j < right - 1 - (i - left); ++j) {
            if (arr[j] > arr[j + 1]) swap(arr[j], arr[j + 1]);
        }
    }
    for (int i = left; i < right; ++i) {
        safePrint(name, to_string(arr[i]));
        this_thread::sleep_for(chrono::milliseconds(15));
    }
}

int main() {
    setlocale(LC_ALL, "Russian");

    const int N = 10;
    vector<double> arr(N);
    random_device rd;
    mt19937 gen(rd());
    uniform_real_distribution<> dis(1.0, 100.0);
    for (int i = 0; i < N; i++) arr[i] = dis(gen);

    cout << "Исходный массив: ";
    for (double x : arr) cout << x << " ";
    cout << endl;

    int mid = N / 2;

    cout << "\n1. Демонстрация thread\n";
    vector<double> arr_copy = arr;

    thread t1(bubbleSort, ref(arr_copy), 0, mid, "Thread 1 (Left half)");
    thread t2(bubbleSort, ref(arr_copy), mid, N, "Thread 2 (Right half)");
    t1.join();
    t2.join();

    thread t3(bubbleSort, ref(arr_copy), 0, N, "Thread 3 (Full)");
    t3.join();

    cout << "\nВсе потоки (thread) завершили работу.\n\n";

    cout << "2. Демонстрация async\n";
    vector<double> arr_copy2 = arr;

    auto f1 = async(launch::async, bubbleSort, ref(arr_copy2), 0, mid, "Thread 1 (Left half)");
    auto f2 = async(launch::async, bubbleSort, ref(arr_copy2), mid, N, "Thread 2 (Right half)");
    f1.wait();
    f2.wait();

    auto f3 = async(launch::async, bubbleSort, ref(arr_copy2), 0, N, "Thread 3 (Full)");
    f3.wait();

    cout << "\nВсе асинхронные задачи (async) завершили работу." << endl;
    return 0;
}
