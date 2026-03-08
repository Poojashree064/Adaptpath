const questions = [
  // ---------------- APTITUDE (20 questions) ----------------
  {
    id: 1,
    section: "Aptitude",
    question: "If a number is divided by 5, the remainder is 3. What will be the remainder if the number is divided by 15?",
    options: ["3", "8", "3 or 8", "Cannot be determined"],
    answer: "Cannot be determined"
  },
  {
    id: 2,
    section: "Aptitude",
    question: "A train 150m long passes a pole in 15 seconds. What is its speed in km/hr?",
    options: ["36", "40", "45", "50"],
    answer: "36"
  },
  {
    id: 3,
    section: "Aptitude",
    question: "If 20% of A = 50% of B, then what percentage of A is B?",
    options: ["25%", "40%", "50%", "250%"],
    answer: "40%"
  },
  {
    id: 4,
    section: "Aptitude",
    question: "The average of 5 consecutive numbers is 18. What is the largest number?",
    options: ["18", "19", "20", "22"],
    answer: "20"
  },
  {
    id: 5,
    section: "Aptitude",
    question: "A sum of money doubles itself in 8 years at simple interest. What is the rate of interest?",
    options: ["10%", "12.5%", "15%", "20%"],
    answer: "12.5%"
  },
  {
    id: 6,
    section: "Aptitude",
    question: "If A:B = 2:3 and B:C = 4:5, then A:C is:",
    options: ["8:15", "2:5", "3:5", "4:5"],
    answer: "8:15"
  },
  {
    id: 7,
    section: "Aptitude",
    question: "A shopkeeper marks his goods 40% above cost price and gives a discount of 25%. His profit percentage is:",
    options: ["5%", "10%", "15%", "20%"],
    answer: "5%"
  },
  {
    id: 8,
    section: "Aptitude",
    question: "The sum of first 50 natural numbers is:",
    options: ["1225", "1250", "1275", "1300"],
    answer: "1275"
  },
  {
    id: 9,
    section: "Aptitude",
    question: "If log₂(x) = 5, then x equals:",
    options: ["10", "16", "25", "32"],
    answer: "32"
  },
  {
    id: 10,
    section: "Aptitude",
    question: "A can complete a work in 12 days and B in 18 days. Working together, they will complete the work in:",
    options: ["6 days", "7.2 days", "8 days", "9 days"],
    answer: "7.2 days"
  },
  {
    id: 11,
    section: "Aptitude",
    question: "If 3x - 7 = 20, then x equals:",
    options: ["7", "8", "9", "10"],
    answer: "9"
  },
  {
    id: 12,
    section: "Aptitude",
    question: "The LCM of 12, 15, and 20 is:",
    options: ["60", "90", "120", "180"],
    answer: "60"
  },
  {
    id: 13,
    section: "Aptitude",
    question: "If the cost price is 80% of the selling price, the profit percentage is:",
    options: ["20%", "25%", "30%", "35%"],
    answer: "25%"
  },
  {
    id: 14,
    section: "Aptitude",
    question: "A boat travels 30 km upstream in 6 hours and 30 km downstream in 3 hours. The speed of the stream is:",
    options: ["2.5 km/hr", "3 km/hr", "3.5 km/hr", "4 km/hr"],
    answer: "2.5 km/hr"
  },
  {
    id: 15,
    section: "Aptitude",
    question: "The compound interest on Rs. 1000 for 2 years at 10% per annum is:",
    options: ["Rs. 200", "Rs. 210", "Rs. 220", "Rs. 230"],
    answer: "Rs. 210"
  },
  {
    id: 16,
    section: "Aptitude",
    question: "If 2⁵ × 2³ = 2ˣ, then x equals:",
    options: ["6", "7", "8", "15"],
    answer: "8"
  },
  {
    id: 17,
    section: "Aptitude",
    question: "The probability of getting a sum of 7 when two dice are thrown is:",
    options: ["1/6", "1/12", "5/36", "7/36"],
    answer: "1/6"
  },
  {
    id: 18,
    section: "Aptitude",
    question: "If the perimeter of a square is 40 cm, its area is:",
    options: ["64 cm²", "81 cm²", "100 cm²", "121 cm²"],
    answer: "100 cm²"
  },
  {
    id: 19,
    section: "Aptitude",
    question: "The next number in the series 2, 6, 12, 20, 30, ___ is:",
    options: ["40", "42", "44", "48"],
    answer: "42"
  },
  {
    id: 20,
    section: "Aptitude",
    question: "If x² - 5x + 6 = 0, then x can be:",
    options: ["2 or 3", "1 or 6", "-2 or -3", "2 or -3"],
    answer: "2 or 3"
  },

  // ---------------- LOGICAL REASONING (15 questions) ----------------
  {
    id: 21,
    section: "Logical Reasoning",
    question: "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies.",
    options: ["True", "False", "Cannot say", "None of these"],
    answer: "True"
  },
  {
    id: 22,
    section: "Logical Reasoning",
    question: "Find the odd one out: 3, 5, 7, 12, 13, 17, 19",
    options: ["3", "5", "12", "19"],
    answer: "12"
  },
  {
    id: 23,
    section: "Logical Reasoning",
    question: "In a certain code, COMPUTER is written as RFUVQNPC. How is MEDICINE written?",
    options: ["EOJDJEFM", "EOJDIFEM", "MFEJDJOE", "MFEJDOOF"],
    answer: "MFEJDJOE"
  },
  {
    id: 24,
    section: "Logical Reasoning",
    question: "If A is to the north of B and C is to the east of B, in what direction is A with respect to C?",
    options: ["Northeast", "Northwest", "Southeast", "Southwest"],
    answer: "Northwest"
  },
  {
    id: 25,
    section: "Logical Reasoning",
    question: "Complete the series: 1, 4, 9, 16, 25, ___",
    options: ["30", "35", "36", "49"],
    answer: "36"
  },
  {
    id: 26,
    section: "Logical Reasoning",
    question: "Which number is wrong in the series: 7, 28, 63, 124, 215, 342",
    options: ["28", "63", "124", "342"],
    answer: "342"
  },
  {
    id: 27,
    section: "Logical Reasoning",
    question: "If FRIEND is coded as HUMJTK, how is FAMILY coded?",
    options: ["HCOKNA", "HCNKOA", "DZNGRW", "GBNJMZ"],
    answer: "HCOKNA"
  },
  {
    id: 28,
    section: "Logical Reasoning",
    question: "All roses are flowers. Some flowers are red. Therefore:",
    options: ["All roses are red", "Some roses are red", "No roses are red", "Cannot be determined"],
    answer: "Cannot be determined"
  },
  {
    id: 29,
    section: "Logical Reasoning",
    question: "How many triangles are there in a pentagram (5-pointed star)?",
    options: ["5", "10", "15", "35"],
    answer: "35"
  },
  {
    id: 30,
    section: "Logical Reasoning",
    question: "If the day before yesterday was Thursday, what will be the day after tomorrow?",
    options: ["Sunday", "Monday", "Tuesday", "Wednesday"],
    answer: "Monday"
  },
  {
    id: 31,
    section: "Logical Reasoning",
    question: "Mirror image of OBJECTIVE is:",
    options: ["ƎVIƬƆƎꓩᙠO", "EVITCEJBO", "OBJECTIVE", "BOJECTIVE"],
    answer: "EVITCEJBO"
  }, 
  {
    id: 32,
    section: "Logical Reasoning",
    question: "A is the father of B. B is the brother of C. C is the daughter of D. How is D related to A?",
    options: ["Brother", "Sister", "Wife", "Cannot be determined"],
    answer: "Wife"
  },
  {
    id: 33,
    section: "Logical Reasoning",
    question: "Find the missing number: 2, 5, 10, 17, 26, ___",
    options: ["35", "36", "37", "38"],
    answer: "37"
  },
  {
    id: 34,
    section: "Logical Reasoning",
    question: "If CAT = 24 and DOG = 26, then BIRD = ?",
    options: ["32", "34", "36", "40"],
    answer: "32"
  },
  {
    id: 35,
    section: "Logical Reasoning",
    question: "Which one is different from the rest?",
    options: ["Copper", "Iron", "Brass", "Zinc"],
    answer: "Brass"
  },

  // ---------------- DATA STRUCTURES (15 questions) ----------------
  {
    id: 36,
    section: "DSA",
    question: "The time complexity of binary search is:",
    options: ["O(n)", "O(log n)", "O(n²)", "O(n log n)"],
    answer: "O(log n)"
  },
  {
    id: 37,
    section: "DSA",
    question: "Which data structure uses LIFO principle?",
    options: ["Queue", "Stack", "Tree", "Graph"],
    answer: "Stack"
  },
  {
    id: 38,
    section: "DSA",
    question: "In a circular linked list:",
    options: ["Each node points to the previous node", "The last node points to NULL", "The last node points to the first node", "Each node has two pointers"],
    answer: "The last node points to the first node"
  },
  {
    id: 39,
    section: "DSA",
    question: "The worst-case time complexity of quicksort is:",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    answer: "O(n²)"
  },
  {
    id: 40,
    section: "DSA",
    question: "A binary tree with n nodes has how many NULL pointers?",
    options: ["n", "n+1", "2n", "n-1"],
    answer: "n+1"
  },
  {
    id: 41,
    section: "DSA",
    question: "Which traversal of binary tree gives nodes in non-decreasing order for BST?",
    options: ["Preorder", "Inorder", "Postorder", "Level order"],
    answer: "Inorder"
  },
  {
    id: 42,
    section: "DSA",
    question: "The maximum number of nodes in a binary tree of height h is:",
    options: ["2ʰ", "2ʰ - 1", "2ʰ⁺¹ - 1", "2ʰ⁺¹"],
    answer: "2ʰ⁺¹ - 1"
  },
  {
    id: 43,
    section: "DSA",
    question: "Hash table collision resolution technique that uses linked lists is called:",
    options: ["Linear probing", "Quadratic probing", "Chaining", "Double hashing"],
    answer: "Chaining"
  },
  {
    id: 44,
    section: "DSA",
    question: "Which data structure is used for BFS implementation?",
    options: ["Stack", "Queue", "Tree", "Graph"],
    answer: "Queue"
  },
  {
    id: 45,
    section: "DSA",
    question: "The space complexity of recursive algorithm to find factorial is:",
    options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
    answer: "O(n)"
  },
  {
    id: 46,
    section: "DSA",
    question: "A complete binary tree with n nodes has height:",
    options: ["log₂(n)", "⌊log₂(n)⌋", "⌈log₂(n+1)⌉ - 1", "n"],
    answer: "⌈log₂(n+1)⌉ - 1"
  },
  {
    id: 47,
    section: "DSA",
    question: "Which sorting algorithm is most efficient for nearly sorted data?",
    options: ["Quick sort", "Merge sort", "Insertion sort", "Heap sort"],
    answer: "Insertion sort"
  },
  {
    id: 48,
    section: "DSA",
    question: "The degree of a node in a tree is:",
    options: ["Number of parent nodes", "Number of child nodes", "Height of the node", "Depth of the node"],
    answer: "Number of child nodes"
  },
  {
    id: 49,
    section: "DSA",
    question: "Doubly linked list has which advantage over singly linked list?",
    options: ["Less memory usage", "Faster insertion", "Bidirectional traversal", "Easier implementation"],
    answer: "Bidirectional traversal"
  },
  {
    id: 50,
    section: "DSA",
    question: "Priority queue is best implemented using:",
    options: ["Array", "Linked list", "Heap", "Stack"],
    answer: "Heap"
  },

  // ---------------- OPERATING SYSTEMS (10 questions) ----------------
  {
    id: 51,
    section: "OS",
    question: "Which scheduling algorithm may cause starvation?",
    options: ["FCFS", "Round Robin", "Shortest Job First", "All of the above"],
    answer: "Shortest Job First"
  },
  {
    id: 52,
    section: "OS",
    question: "Thrashing occurs when:",
    options: ["Process is busy swapping pages in and out", "Process is busy doing I/O", "Process has too much CPU time", "Process has terminated"],
    answer: "Process is busy swapping pages in and out"
  },
  {
    id: 53,
    section: "OS",
    question: "A system is in a safe state if:",
    options: ["Deadlock cannot occur", "Resources can be allocated in some order", "All processes can finish", "Both b and c"],
    answer: "Both b and c"
  },
  {
    id: 54,
    section: "OS",
    question: "The degree of multiprogramming indicates:",
    options: ["Number of processors", "Number of programs in memory", "Number of programs on disk", "Number of users"],
    answer: "Number of programs in memory"
  },
  {
    id: 55,
    section: "OS",
    question: "Which is NOT a necessary condition for deadlock?",
    options: ["Mutual exclusion", "Hold and wait", "Preemption", "Circular wait"],
    answer: "Preemption"
  },
  {
    id: 56,
    section: "OS",
    question: "Virtual memory allows:",
    options: ["Execution of processes larger than physical memory", "Faster program execution", "More secure programs", "Better file management"],
    answer: "Execution of processes larger than physical memory"
  },
  {
    id: 57,
    section: "OS",
    question: "In paging, the page table contains:",
    options: ["Physical addresses", "Logical addresses", "Frame numbers", "Page numbers"],
    answer: "Frame numbers"
  },
  {
    id: 58,
    section: "OS",
    question: "What is a zombie process?",
    options: ["Process that has terminated but parent hasn't read exit status", "Process waiting for I/O", "Process that cannot be killed", "Process in deadlock"],
    answer: "Process that has terminated but parent hasn't read exit status"
  },
  {
    id: 59,
    section: "OS",
    question: "Critical section problem requires:",
    options: ["Mutual exclusion", "Progress", "Bounded waiting", "All of the above"],
    answer: "All of the above"
  },
  {
    id: 60,
    section: "OS",
    question: "The hit ratio in memory management refers to:",
    options: ["Page faults / Total references", "Page hits / Total references", "Total references / Page hits", "None of these"],
    answer: "Page hits / Total references"
  },

  // ---------------- DBMS (10 questions) ----------------
  {
    id: 61,
    section: "DBMS",
    question: "Which normal form eliminates transitive dependency?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    answer: "3NF"
  },
  {
    id: 62,
    section: "DBMS",
    question: "ACID properties in transactions stand for:",
    options: ["Atomicity, Consistency, Isolation, Durability", "Atomicity, Concurrency, Isolation, Durability", "Accuracy, Consistency, Isolation, Durability", "Atomicity, Consistency, Integration, Durability"],
    answer: "Atomicity, Consistency, Isolation, Durability"
  },
  {
    id: 63,
    section: "DBMS",
    question: "Which join returns all rows from both tables?",
    options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
    answer: "FULL OUTER JOIN"
  },
  {
    id: 64,
    section: "DBMS",
    question: "A primary key can be:",
    options: ["NULL", "Duplicate", "Both a and b", "Neither a nor b"],
    answer: "Neither a nor b"
  },
  {
    id: 65,
    section: "DBMS",
    question: "Which is the fastest: SELECT * or SELECT column_names?",
    options: ["SELECT *", "SELECT column_names", "Both same", "Depends on the database"],
    answer: "SELECT column_names"
  },
  {
    id: 66,
    section: "DBMS",
    question: "What does CASCADE in foreign key constraint do?",
    options: ["Prevents deletion", "Automatically deletes related records", "Updates related records", "Both b and c depending on context"],
    answer: "Both b and c depending on context"
  },
  {
    id: 67,
    section: "DBMS",
    question: "Index in database improves:",
    options: ["INSERT performance", "UPDATE performance", "SELECT performance", "DELETE performance"],
    answer: "SELECT performance"
  },
  {
    id: 68,
    section: "DBMS",
    question: "Which isolation level has highest concurrency but lowest consistency?",
    options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
    answer: "Read Uncommitted"
  },
  {
    id: 69,
    section: "DBMS",
    question: "A view in SQL is:",
    options: ["A physical table", "A virtual table", "A stored procedure", "An index"],
    answer: "A virtual table"
  },
  {
    id: 70,
    section: "DBMS",
    question: "Two-phase locking protocol ensures:",
    options: ["No deadlock", "Serializability", "Maximum concurrency", "Minimum response time"],
    answer: "Serializability"
  },

  // ---------------- COMPUTER NETWORKS (10 questions) ----------------
  {
    id: 71,
    section: "CN",
    question: "Which layer of OSI model handles error correction?",
    options: ["Physical", "Data Link", "Network", "Transport"],
    answer: "Transport"
  },
  {
    id: 72,
    section: "CN",
    question: "TCP is a ___ protocol:",
    options: ["Connection-oriented", "Connectionless", "Stateless", "Unreliable"],
    answer: "Connection-oriented"
  },
  {
    id: 73,
    section: "CN",
    question: "The default subnet mask for Class B network is:",
    options: ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.255"],
    answer: "255.255.0.0"
  },
  {
    id: 74,
    section: "CN",
    question: "DNS uses which port number?",
    options: ["21", "23", "53", "80"],
    answer: "53"
  },
  {
    id: 75,
    section: "CN",
    question: "Which protocol is used for email sending?",
    options: ["POP3", "SMTP", "IMAP", "FTP"],
    answer: "SMTP"
  },
  {
    id: 76,
    section: "CN",
    question: "Maximum size of TCP header is:",
    options: ["20 bytes", "40 bytes", "60 bytes", "80 bytes"],
    answer: "60 bytes"
  },
  {
    id: 77,
    section: "CN",
    question: "ARP resolves:",
    options: ["IP to MAC address", "MAC to IP address", "Domain to IP address", "IP to Domain name"],
    answer: "IP to MAC address"
  },
  {
    id: 78,
    section: "CN",
    question: "Which device operates at Network layer?",
    options: ["Hub", "Switch", "Router", "Bridge"],
    answer: "Router"
  },
  {
    id: 79,
    section: "CN",
    question: "HTTP is a ___ protocol:",
    options: ["Stateful", "Stateless", "Connection-oriented", "Encrypted"],
    answer: "Stateless"
  },
  {
    id: 80,
    section: "CN",
    question: "Time-to-Live (TTL) field is present in:",
    options: ["TCP header", "UDP header", "IP header", "Ethernet frame"],
    answer: "IP header"
  },

  // ---------------- PROGRAMMING (10 questions) ----------------
  {
    id: 81,
    section: "Programming",
    question: "Which OOP principle hides implementation details?",
    options: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"],
    answer: "Encapsulation"
  },
  {
    id: 82,
    section: "Programming",
    question: "What is method overloading?",
    options: ["Same method name, different signatures in same class", "Same method name in parent and child class", "Different method names, same signature", "None of these"],
    answer: "Same method name, different signatures in same class"
  },
  {
    id: 83,
    section: "Programming",
    question: "Which keyword is used to prevent method overriding in Java?",
    options: ["static", "final", "abstract", "private"],
    answer: "final"
  },
  {
    id: 84,
    section: "Programming",
    question: "What is a deadlock in multithreading?",
    options: ["Thread waiting indefinitely for resource", "Thread in infinite loop", "Thread terminated abnormally", "Thread executing slowly"],
    answer: "Thread waiting indefinitely for resource"
  },
  {
    id: 85,
    section: "Programming",
    question: "Which is faster: array or linked list access by index?",
    options: ["Array", "Linked list", "Both same", "Depends on size"],
    answer: "Array"
  },
  {
    id: 86,
    section: "Programming",
    question: "Exception handling uses which keywords? (Choose most complete)",
    options: ["try, catch", "try, catch, finally", "try, catch, throw", "try, catch, finally, throw, throws"],
    answer: "try, catch, finally, throw, throws"
  },
  {
    id: 87,
    section: "Programming",
    question: "What is the output of: print(5 // 2) in Python?",
    options: ["2.5", "2", "3", "Error"],
    answer: "2"
  },
  {
    id: 88,
    section: "Programming",
    question: "Which data structure is used in recursion implementation?",
    options: ["Queue", "Stack", "Tree", "Graph"],
    answer: "Stack"
  },
  {
    id: 89,
    section: "Programming",
    question: "What is a lambda function?",
    options: ["Named function", "Anonymous function", "Recursive function", "Built-in function"],
    answer: "Anonymous function"
  },
  {
    id: 90,
    section: "Programming",
    question: "Constructor can be:",
    options: ["Private", "Protected", "Public", "All of the above"],
    answer: "All of the above"
  },

  // ---------------- ALGORITHMS (10 questions) ----------------
  {
    id: 91,
    section: "Algorithms",
    question: "Which algorithm technique does dynamic programming use?",
    options: ["Divide and conquer", "Greedy approach", "Memoization", "Backtracking"],
    answer: "Memoization"
  },
  {
    id: 92,
    section: "Algorithms",
    question: "Dijkstra's algorithm finds:",
    options: ["Minimum spanning tree", "Shortest path from source", "Maximum flow", "Topological sort"],
    answer: "Shortest path from source"
  },
  {
    id: 93,
    section: "Algorithms",
    question: "Which is stable sorting algorithm?",
    options: ["Quick sort", "Heap sort", "Merge sort", "Selection sort"],
    answer: "Merge sort"
  },
  {
    id: 94,
    section: "Algorithms",
    question: "Time complexity of bubble sort is:",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    answer: "O(n²)"
  },
  {
    id: 95,
    section: "Algorithms",
    question: "KMP algorithm is used for:",
    options: ["Sorting", "Searching", "Pattern matching", "Graph traversal"],
    answer: "Pattern matching"
  },
  {
    id: 96,
    section: "Algorithms",
    question: "Which algorithm uses divide and conquer?",
    options: ["Linear search", "Binary search", "Bubble sort", "Insertion sort"],
    answer: "Binary search"
  },
  {
    id: 97,
    section: "Algorithms",
    question: "Best case time complexity of insertion sort is:",
    options: ["O(1)", "O(n)", "O(n log n)", "O(n²)"],
    answer: "O(n)"
  },
  {
    id: 98,
    section: "Algorithms",
    question: "Floyd-Warshall algorithm finds:",
    options: ["Single source shortest path", "All pairs shortest path", "Minimum spanning tree", "Topological order"],
    answer: "All pairs shortest path"
  },
  {
    id: 99,
    section: "Algorithms",
    question: "Which searching algorithm requires sorted data?",
    options: ["Linear search", "Binary search", "Jump search", "Both b and c"],
    answer: "Both b and c"
  },
  {
    id: 100,
    section: "Algorithms",
    question: "Greedy algorithm always gives:",
    options: ["Optimal solution", "Feasible solution", "Both a and b", "Neither a nor b"],
    answer: "Feasible solution"
  },

  // ---------------- SQL (2 questions) ----------------
  {
    id: 101,
    section: "SQL",
    question: "Write a query to find all employees in the 'IT' department with salary greater than 50000, ordered by salary in descending order.\n\nTable: employees (emp_id, name, department, salary, join_date)",
    type: "sql",
    answer: "SELECT * FROM employees WHERE department = 'IT' AND salary > 50000 ORDER BY salary DESC;"
  },
  {
    id: 102,
    section: "SQL",
    question: "Write a query to find the average marks of each student along with their name.\n\nTables: students (student_id, name, age), grades (student_id, subject, marks)",
    type: "sql",
    answer: "SELECT s.name, AVG(g.marks) as average_marks FROM students s JOIN grades g ON s.student_id = g.student_id GROUP BY s.student_id, s.name;"
  },

  // ---------------- CODING (2 questions) ----------------
  {
    id: 103,
    section: "Coding",
    question: "Two Sum Problem: Given an array of integers and a target sum, find if there exists a pair that adds up to the target. Return the indices.\n\nExample: arr = [2, 7, 11, 15], target = 9\nOutput: [0, 1]\n\nConstraints:\n- Array length: 2 ≤ n ≤ 10⁴\n- -10⁹ ≤ arr[i] ≤ 10⁹\n- Each input has exactly one solution",
    type: "code",
    answer: "def two_sum(arr, target):\n    seen = {}\n    for i, num in enumerate(arr):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\n# Time: O(n), Space: O(n)"
  },
  {
    id: 104,
    section: "Coding",
    question: "Longest Substring Without Repeating Characters: Given a string, find the length of the longest substring without repeating characters.\n\nExample: 'abcabcbb' → 3 ('abc')\n'bbbbb' → 1 ('b')\n'pwwkew' → 3 ('wke')\n\nConstraints:\n- 0 ≤ s.length ≤ 5 × 10⁴\n- String consists of English letters, digits, symbols and spaces",
    type: "code",
    answer: "def length_of_longest_substring(s):\n    char_index = {}\n    max_length = 0\n    start = 0\n    \n    for end, char in enumerate(s):\n        if char in char_index and char_index[char] >= start:\n            start = char_index[char] + 1\n        \n        char_index[char] = end\n        max_length = max(max_length, end - start + 1)\n    \n    return max_length\n\n# Time: O(n), Space: O(min(m,n))"
  }
];

export default questions;