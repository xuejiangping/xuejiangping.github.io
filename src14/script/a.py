a = open('./index.html', encoding='utf-8')
# print(a)
# b = a.read()
# print(b)
# 冒泡排序算法


def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr


c = bubble_sort([1, 4, 22, 44, 21, 31, 7])
print(c)
d = list(range(0, 100, 5))
print(d)
