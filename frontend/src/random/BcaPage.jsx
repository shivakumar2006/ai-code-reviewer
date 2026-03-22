import React, { useState } from 'react';
import logo from "./dpgitm.png";
import { IoSearch } from "react-icons/io5";

const BcaPage = () => {

    const [active, setActive] = useState("Overview");

    const menuItems = [
        "Overview",
        "Courses Available",
        "HoD Message",
        "Faculty",
        "Vision & Mission",
        "PEOs and PO’s",
        "Labs & Infrastructure",
        "Employment Opportunities",
        "Clubs",
        "Training & Placement",
        "Syllabus and Scheme of Study",
        "Lecture Plan",
        "Previous Year’s MDU Question Papers",
        "Department Results and Toppers",
    ];

    const renderContent = () => {
        switch (active) {
            case "Overview":
                return (
                    <div className="text-gray-700 space-y-4 leading-relaxed">

                        <p>
                            <span className="font-semibold text-blue-900">
                                Bachelor of Computer Applications (BCA)
                            </span> is a 3-year undergraduate degree program focused on building a strong
                            foundation in computer applications and software development. It is considered
                            equivalent to B.Tech/BE in Computer Science or Information Technology in terms
                            of career opportunities.
                        </p>

                        <p>
                            The program covers key subjects such as database management systems, operating
                            systems, software engineering, web technologies, and programming languages like
                            C, C++, Java, and HTML. It helps students prepare for advanced careers in the
                            IT industry.
                        </p>

                        <p>
                            BCA graduates are highly valued by top companies such as
                            <span className="font-medium"> HP, Accenture, Capgemini, Cognizant</span>
                            and modern startups like
                            <span className="font-medium"> Flipkart</span>.
                        </p>

                        <p>
                            With increasing digitization, the demand for skilled computer professionals is
                            continuously rising. Strong programming knowledge gives students a competitive edge.
                        </p>

                        <div>
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                Popular BCA Specializations
                            </h3>

                            <ul className="grid grid-cols-2 gap-2 list-disc pl-5">
                                <li>Internet Technologies</li>
                                <li>Animation</li>
                                <li>Network Systems</li>
                                <li>Programming Languages (C++, Java)</li>
                                <li>Systems Analysis</li>
                                <li>Music & Video Processing</li>
                                <li>Management Information System (MIS)</li>
                                <li>Accounting Applications</li>
                            </ul>
                        </div>

                    </div>
                );


            case "Courses Available":
                return (
                    <div className="space-y-6">

                        <h2 className="text-xl font-bold text-blue-900">
                            BCA Syllabus & Scheme of Examination
                        </h2>

                        <p className="text-gray-600">
                            Download the detailed syllabus and scheme of examination for BCA program.
                        </p>

                        {/* CARDS */}
                        <div className="grid md:grid-cols-2 gap-6">

                            {/* 6 SEM CARD */}
                            <div className="bg-white border rounded-xl shadow-md p-5 hover:shadow-lg transition">
                                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                                    BCA (6 Semesters)
                                </h3>

                                <p className="text-gray-600 text-sm mb-4">
                                    Syllabus and Scheme of Examination for Ist, IInd and IIIrd Year (6 Semesters).
                                </p>

                                <button className="bg-orange-500 cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition">
                                    Download PDF
                                </button>
                            </div>

                            {/* 8 SEM CARD */}
                            <div className="bg-white border rounded-xl shadow-md p-5 hover:shadow-lg transition">
                                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                                    BCA (8 Semesters)
                                </h3>

                                <p className="text-gray-600 text-sm mb-4">
                                    Updated syllabus and scheme of examination for 4-year program (8 Semesters).
                                </p>

                                <button className="bg-orange-500 cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition">
                                    Download PDF
                                </button>
                            </div>

                        </div>

                    </div>
                );

            case "HoD Message":
                return (
                    <div className="bg-white rounded-xl shadow-lg p-8 flex gap-10 items-center">

                        {/* LEFT PROFILE CARD */}
                        <div className="flex flex-col items-center text-center">

                            <div className="relative">
                                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-orange-500 shadow-md">
                                    <img
                                        src="/hod.jpg"
                                        alt="HOD"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Decorative ring */}
                                <div className="absolute inset-0 rounded-full border-2 border-blue-800 animate-pulse"></div>
                            </div>

                            <h3 className="mt-5 text-xl font-bold text-blue-900">
                                Rashmi Verma
                            </h3>

                            <p className="text-gray-500 text-sm tracking-wide">
                                Head of Department - CAD
                            </p>
                        </div>

                        {/* RIGHT CONTENT */}
                        <div className="flex-1 text-gray-700 space-y-5 leading-relaxed">

                            <h2 className="text-2xl font-bold text-blue-900 border-l-4 border-orange-500 pl-3">
                                Message from the Head of Department
                            </h2>

                            <p>
                                The Department of Computer Applications at DPGITM, affiliated with MDU
                                University, Rohtak, is committed to delivering excellence in education
                                and innovation. Our faculty members bring extensive experience and
                                dedication to nurture globally competitive professionals.
                            </p>

                            <p>
                                We actively explore cutting-edge domains including
                                <span className="font-medium"> Data Science, Machine Learning, Cloud Computing, IoT, </span>
                                and Digital Image Processing, ensuring our students stay ahead in the evolving tech landscape.
                            </p>

                            <p>
                                Through collaborations with leading industries and institutions, our students
                                gain exposure to real-world challenges and research opportunities, contributing
                                to impactful innovations and publications.
                            </p>

                            <p>
                                As one of the most preferred departments at DPGITM, we welcome passionate learners
                                ready to explore, innovate, and build a successful future in Computer Science.
                            </p>

                            <p className="font-semibold text-orange-600">
                                Join us and be a part of innovation-driven excellence.
                            </p>

                        </div>

                    </div>
                );

            case "Faculty":
                const facultyData = [
                    {
                        name: "Rashmi Verma",
                        role: "HOD & Assistant Professor",
                        details: [
                            "Qualification: BE, MTech, Pursuing Ph.D",
                            "Area of Interest: Cloud Computing (20 years experience)",
                            "Journal: 3",
                            "International Conference: 4",
                            "Scopus Journal: 1",
                            "Patents: 4",
                        ],
                    },
                    {
                        name: "Dr. Payal Jindal",
                        role: "Assistant Professor",
                        details: [
                            "Qualification: BSc, MCA, PhD",
                            "Area of Interest: Wireless Sensor Network (4.5 years)",
                            "Scopus Journal: 1",
                            "National Conference: 2",
                            "Journal: 2",
                            "Patent: 2",
                        ],
                    },
                    {
                        name: "Ms. Monika Thakran",
                        role: "Assistant Professor",
                        details: [
                            "Qualification: BCA, MCA, B.Ed., Pursuing Ph.D",
                            "Workshop/FDP/STP: 9",
                            "Area: Machine Learning (AI) (3 years)",
                            "Publication: 3",
                            "Patents/Scopus/SCI: 1",
                        ],
                    },
                    {
                        name: "Ms. Harshita Sharma",
                        role: "Assistant Professor",
                        details: [
                            "Qualification: B.Tech, M.Tech",
                            "Area: Computer Networks & Network Security (1 year)",
                        ],
                    },
                    {
                        name: "Ashish Dhillon",
                        role: "Assistant Professor",
                        details: [
                            "Qualification: M.Tech",
                            "Experience: 2 Years",
                            "Area: Cybersecurity",
                            "Publications: 2",
                        ],
                    },
                    {
                        name: "Dr. Nidhi Sharma",
                        role: "Assistant Professor",
                        details: [
                            "Qualification: PhD",
                            "Experience: 15.8 Years",
                            "Area: Network Security",
                            "Publications: 4",
                        ],
                    },
                    {
                        name: "Dr. Anju",
                        role: "Assistant Professor",
                        details: [
                            "Qualification: PhD",
                            "Experience: 2 Years",
                            "Area: Wireless Sensor Networks",
                            "Other Achievements: UGC NET Qualified (2015, 2016)",
                        ],
                        publications: [
                            "An Effective Approach to Optimise Replication in Peer-to-Peer Networks",
                            "A Fuzzy Based Approach for Effective Data Replication in Peer-to-Peer Networks",
                            "Review of Energy Saving Protocols in WSNs",
                            "An Innovative Technique Linear Cluster Handling for Energy Efficiency in Linear WSNs",
                            "Optimization of energy conservation in WSN",
                            "INC MPPT based optimization SEH-WSN",
                            "Load balancing in heterogeneous WSN",
                            "Cross layer Optimization in WSN",
                        ],
                    },
                    {
                        name: "Mr. Deepak Sharma",
                        role: "Assistant Professor",
                        details: [
                            "Qualification: MCA, BCA",
                            "Experience: 7 Years",
                            "Area: Data Security (DLP), 3D Holography (R&D)",
                        ],
                    },
                    {
                        name: "Ms. Neha Sharma",
                        role: "Assistant Professor",
                        details: [
                            "Qualification: MCA, BSc",
                            "Area: Java",
                        ],
                    },
                    {
                        name: "Divya Sharma",
                        role: "Assistant Professor",
                        details: [
                            "Qualification: MCA, BSc",
                            "Experience: 6 Months",
                            "Area: SQL, Python",
                        ],
                    },
                    {
                        name: "Ms. Poonam",
                        role: "Assistant Professor",
                        details: [
                            "Qualification: B.Tech, M.Tech",
                            "Experience: 4.5 Years",
                            "Area: DBMS",
                        ],
                    },
                    {
                        name: "Anjali Sharma",
                        role: "Assistant Professor",
                        details: [
                            "Qualification: BA",
                            "Experience: Fresher",
                        ],
                    },
                    {
                        name: "Preeti Sharma",
                        role: "Assistant Professor",
                        details: [
                            "Qualification: MCA, BCA",
                            "Pursuing: PhD",
                            "Area: Deep Learning",
                            "Experience: 3 Years",
                        ],
                    },
                    {
                        name: "Subodh Bhatt",
                        role: "Assistant Professor",
                        details: [
                            "Qualification: B.Tech (AI)",
                            "Area: Sports",
                        ],
                    },
                    {
                        name: "Varsha Yadav",
                        role: "Assistant Professor",
                        details: [
                            "Qualification: MCA, MSc, BSc (Hons)",
                            "Area: Artificial Intelligence",
                            "Experience: Fresher",
                        ],
                    },
                    {
                        name: "Sonu Yadav",
                        role: "Assistant Professor",
                        details: [
                            "Qualification: B.Tech (IT), M.Tech (CSE), MBA (HR & Mkt.)",
                            "UGC NET Qualified",
                        ],
                    },
                ];

                return (
                    <div className="space-y-6">

                        <h2 className="text-2xl font-bold text-blue-900">
                            Faculty Members
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">

                            {facultyData.map((faculty, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition flex gap-5"
                                >

                                    {/* IMAGE */}
                                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
                                        {faculty.name.charAt(0)}
                                    </div>

                                    {/* CONTENT */}
                                    <div className="flex-1 space-y-2">

                                        <h3 className="text-lg font-semibold text-blue-900">
                                            {faculty.name}
                                        </h3>

                                        <p className="text-sm text-gray-500">
                                            {faculty.role}
                                        </p>

                                        {/* DETAILS */}
                                        <ul className="text-sm text-gray-700 space-y-1 list-disc pl-4">
                                            {faculty.details.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>

                                        {/* PUBLICATIONS (ONLY IF EXISTS) */}
                                        {faculty.publications && (
                                            <div className="mt-2">
                                                <p className="text-sm font-semibold text-blue-800">
                                                    Publications:
                                                </p>

                                                <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1 max-h-40 overflow-y-auto">
                                                    {faculty.publications.map((pub, i) => (
                                                        <li key={i}>{pub}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                    </div>

                                </div>
                            ))}

                        </div>

                    </div>
                );
            case "Vision & Mission":
                return (
                    <div className="space-y-10">

                        {/* HEADER */}
                        <div>
                            <h2 className="text-2xl font-bold text-blue-900">
                                Vision & Mission
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">
                                Our commitment towards excellence, innovation, and societal impact.
                            </p>
                        </div>

                        {/* VISION */}
                        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-xl shadow-lg p-6">

                            <h3 className="text-xl font-semibold mb-3 border-l-4 border-orange-400 pl-3">
                                Vision
                            </h3>

                            <p className="leading-relaxed text-sm">
                                To become leaders in providing academic excellence with strong career
                                development skills, nurturing students to compete globally. The curriculum
                                focuses on both theoretical foundations and hands-on experience in Computer
                                Science and Engineering, while instilling social and ethical values to
                                contribute meaningfully to society.
                            </p>

                        </div>

                        {/* MISSION */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border">

                            <h3 className="text-xl font-semibold text-blue-900 mb-4 border-l-4 border-orange-500 pl-3">
                                Mission
                            </h3>

                            <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">

                                <li className="flex gap-2">
                                    <span className="text-orange-500 font-bold">•</span>
                                    To achieve academic excellence through innovative learning practices.
                                </li>

                                <li className="flex gap-2">
                                    <span className="text-orange-500 font-bold">•</span>
                                    To collaborate with industries and provide opportunities for students
                                    to develop employability and entrepreneurial skills.
                                </li>

                                <li className="flex gap-2">
                                    <span className="text-orange-500 font-bold">•</span>
                                    To prepare students to adapt to the challenges of an ever-changing
                                    global market.
                                </li>

                                <li className="flex gap-2">
                                    <span className="text-orange-500 font-bold">•</span>
                                    To enrich students with professional ethics, integrity, and values
                                    to serve society responsibly.
                                </li>

                            </ul>

                        </div>

                    </div>
                );

            case "PEOs and PO’s":
                return (
                    <div className="space-y-10">

                        {/* PEOs */}
                        <div>
                            <h3 className="text-xl font-semibold text-blue-900 mb-4">
                                Program Educational Objectives (PEOs)
                            </h3>

                            <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-5">
                                <li><span className="font-semibold">PEO1:</span> To excel in their professional career with expertise in providing solutions to Computer Science and Technology problems.</li>
                                <li><span className="font-semibold">PEO2:</span> To exhibit adaptive and agile skills in the core area of Computer Science & Engineering to meet the technical and managerial challenges.</li>
                                <li><span className="font-semibold">PEO3:</span> To demonstrate interpersonal skills, professional ethics to work in a team to make a positive impact on society.</li>
                            </ul>
                        </div>

                        {/* POs */}
                        <div>
                            <h3 className="text-xl font-semibold text-blue-900 mb-4">
                                Program Outcomes (POs)
                            </h3>

                            <div className="bg-white shadow-md rounded-lg p-5 max-h-[400px] overflow-y-auto">
                                <ul className="space-y-3 text-gray-700 text-sm leading-relaxed list-disc pl-5">

                                    <li><span className="font-semibold">Engineering knowledge:</span> Apply the knowledge of mathematics, science, engineering fundamentals, and an engineering specialization to the solution of complex engineering problems.</li>

                                    <li><span className="font-semibold">Problem analysis:</span> Identify, formulate, review research literature, and analyze complex engineering problems reaching substantiated conclusions using first principles of mathematics, natural sciences, and engineering sciences.</li>

                                    <li><span className="font-semibold">Design/development of solutions:</span> Design solutions for complex engineering problems and design system components or processes that meet the specified needs with appropriate consideration for the public health and safety, and the cultural, societal, and environmental considerations.</li>

                                    <li><span className="font-semibold">Conduct investigations of complex problems:</span> Use research-based knowledge and research methods including design of experiments, analysis and interpretation of data, and synthesis of the information to provide valid conclusions.</li>

                                    <li><span className="font-semibold">Modern tool usage:</span> Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools including prediction and modeling to complex engineering activities with an understanding of the limitations.</li>

                                    <li><span className="font-semibold">The engineer and society:</span> Apply reasoning informed by the contextual knowledge to assess societal, health, safety, legal and cultural issues and the consequent responsibilities relevant to the professional engineering practice.</li>

                                    <li><span className="font-semibold">Environment and sustainability:</span> Understand the impact of the professional engineering solutions in societal and environmental contexts, and demonstrate the knowledge of, and need for sustainable development.</li>

                                    <li><span className="font-semibold">Ethics:</span> Apply ethical principles and commit to professional ethics and responsibilities and norms of the engineering practice.</li>

                                    <li><span className="font-semibold">Individual and team work:</span> Function effectively as an individual, and as a member or leader in diverse teams, and in multidisciplinary settings.</li>

                                    <li><span className="font-semibold">Communication:</span> Communicate effectively on complex engineering activities with the engineering community and with society at large, such as, being able to comprehend and write effective reports and design documentation, make effective presentations, and give and receive clear instructions.</li>

                                    <li><span className="font-semibold">Project management and finance:</span> Demonstrate knowledge and understanding of the engineering and management principles and apply these to one’s own work, as a member and leader in a team, to manage projects and in multidisciplinary environments.</li>

                                    <li><span className="font-semibold">Life-long learning:</span> Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in the broadest context of technological change.</li>

                                </ul>
                            </div>
                        </div>

                        {/* PSOs */}
                        <div>
                            <h3 className="text-xl font-semibold text-blue-900 mb-4">
                                Program Specific Outcomes (PSOs)
                            </h3>

                            <ul className="space-y-3 text-gray-700 text-sm leading-relaxed list-disc pl-5">

                                <li><span className="font-semibold">PSO1:</span> Computer Science and Engineering graduate should be able to understand, analyze and develop computer programs in the areas related to algorithms, IOT, multimedia, web designing, real time problems, virtual reality, cloud computing and networking for efficient design of computer-based systems.</li>

                                <li><span className="font-semibold">PSO2:</span> The ability to acquaint with the contemporary trends in industrial/research and innovate solutions for real life problems, achieving additional expertise through add-on programs like personality development programs, preparation for higher exams, placement-oriented services, workshops.</li>

                                <li><span className="font-semibold">PSO3:</span> The ability to employ software engineering principles, modern computer languages, environments, and platforms in creating innovative career paths to be a lifelong learner and a zest for higher studies and also to act as a good citizen by inculcating in them moral values & ethics.</li>

                            </ul>
                        </div>

                    </div>
                );

            case "Labs & Infrastructure":
                const labs = [
                    {
                        title: "PC Software Lab",
                        content: `PC Software Lab is a specialized facility that is equipped with computers and software tools that are used for software development, testing, and analysis. These labs are typically found in academic institutions, research organizations, and businesses that develop software products.

Here are some key features and components that may be found in a typical PC software lab:

Computers: The lab will have a set of computers with high processing power, large amounts of memory, and fast storage devices to support software development, testing, and analysis.

Operating Systems: The lab may have multiple operating systems installed on the computers, such as Windows, Linux, and macOS. This allows developers to test their software on different platforms.

Development Tools: The lab will have a wide range of development tools and software packages installed, including compilers, integrated development environments (IDEs), debuggers, version control systems, and testing frameworks.

Network Infrastructure: The lab will be connected to a high-speed network that allows developers to share resources, collaborate, and access remote systems and services.

Virtualization Technology: The lab may use virtualization technology to create and manage multiple virtual machines on a single physical computer. This allows developers to test their software on different environments without needing separate hardware.

Security: The lab will have robust security measures in place to protect the software, data, and intellectual property of the developers and their clients.

Monitoring and Analysis Tools: The lab may have specialized tools for monitoring system performance, analyzing software behavior, and identifying errors and bugs.

Overall, PC software lab is a crucial resource for software developers and organizations that rely on technology for their operations. By providing a dedicated space and specialized tools, these labs help to accelerate the development process and ensure the quality and reliability of software products.`,
                    },

                    {
                        title: "C Programming Lab",
                        content: `C Programming Lab is a hands-on learning environment where students can practice writing and executing C programs. It is usually a part of a computer science curriculum and provides students with an opportunity to learn and apply programming concepts using the C programming language.

The lab may be conducted in a classroom setting or in a computer lab, where students have access to computers equipped with necessary programming tools and software. The lab is usually led by an instructor or a teaching assistant who guides students through the exercises and provides feedback on their work.

During the lab, students may be given a set of programming problems or exercises to complete. These problems may range from basic concepts, such as variables and loops, to more complex topics, such as data structures and algorithms. Students are expected to write and test their programs, and to debug any errors that arise.

In addition to completing programming assignments, students may be required to keep a lab notebook or report detailing their work. This documentation serves as a record of their progress and helps them reflect on their learning.

Overall, C programming lab provides students with an opportunity to practice their programming skills and gain hands-on experience with the C programming language. It helps students develop their problem-solving skills, improve their coding abilities, and gain confidence in their programming abilities.`,
                    },

                    {
                        title: "Data Structures Lab",
                        content: `Data Structure Lab is a hands-on learning environment where students can practice implementing and using different types of data structures. It is usually a part of a computer science curriculum and provides students with an opportunity to learn and apply data structure concepts using programming languages such as C++, Java, or Python.

The lab may be conducted in a classroom setting or in a computer lab, where students have access to computers equipped with necessary programming tools and software. The lab is usually led by an instructor or a teaching assistant who guides students through the exercises and provides feedback on their work.

During the lab, students may be given a set of programming problems or exercises to complete that involve implementing different data structures such as arrays, linked lists, stacks, queues, trees, and graphs. These problems may range from basic concepts, such as inserting and deleting elements in a data structure, to more complex topics, such as searching and sorting algorithms.

In addition to completing programming assignments, students may be required to keep a lab notebook or report detailing their work. This documentation serves as a record of their progress and helps them reflect on their learning.

Overall, data structure lab provides students with an opportunity to practice their programming skills and gain hands-on experience with different types of data structures. It helps students develop their problem-solving skills, improve their coding abilities, and gain confidence in their ability to work with complex data structures.`,
                    },

                    {
                        title: "DBMS Lab",
                        content: `DBMS Lab is a hands-on learning environment where students can practice working with Database Management Systems (DBMS).

In a DBMS lab, students typically work with different types of DBMS software, such as MySQL, Oracle, or Microsoft SQL Server. They learn how to create, modify, and query databases, as well as how to use the software to manage and manipulate data.

Some common activities in a DBMS lab may include designing and implementing a database schema, creating queries to extract information from a database, optimizing database performance, and troubleshooting common issues that arise when working with DBMS software.

Overall, DBMS lab provides students with practical experience in working with database systems, which is an essential skill for many careers in the technology industry.`,
                    },

                    {
                        title: "Web Designing Lab",
                        content: `Web Designing Labs are typically computer labs equipped with software and tools necessary for designing and developing websites. These labs are often found in colleges and universities, as well as vocational schools and community centers. They may be used for classes, workshops, and other educational programs focused on teaching web design skills.

Some common software and tools found in web designing labs include Adobe Creative Suite (including Photoshop, Illustrator, and Dreamweaver), HTML editors such as Notepad++, Sublime Text, or Visual Studio Code, Content Management Systems such as WordPress or Drupal, and CSS preprocessors such as Sass or Less.

In addition to software and tools, web designing labs may also include resources such as books, online tutorials, and sample code for students to reference.`,
                    },

                    {
                        title: "OOPs Lab",
                        content: `The OOPs Lab typically focuses on object-oriented programming concepts and practices. The lab may include hands-on programming exercises and assignments that involve creating and using classes, objects, inheritance, polymorphism, encapsulation, and other OOP concepts.

Some of the topics that may be covered in an OOPs lab include introduction to object-oriented programming, classes and objects, inheritance and polymorphism, encapsulation and data hiding, exception handling, file handling, GUI programming, multithreading and concurrency, networking and socket programming, and database connectivity.

In the lab, students are typically expected to apply the OOP concepts they have learned in class to solve real-world problems. They may work on individual or group projects, and they may be required to present their work and demonstrate their understanding of the concepts.

The lab may use programming languages such as Java, C++, or Python along with development tools like IDEs, debugging tools, and version control systems.`,
                    },

                    {
                        title: "Visual Basic Lab",
                        content: `Visual Basic Lab focuses on teaching students the fundamentals of programming using the Visual Basic language. The lab includes hands-on exercises where students create graphical user interfaces, design forms, and implement functionality using code.

Topics covered include basic programming concepts, control structures, GUI development, form design, event handling, database connectivity, file handling, and debugging techniques.

Students typically use Visual Studio for development and may also work with other tools such as database systems. The lab helps students apply theoretical concepts to real-world problems.`,
                    },

                    {
                        title: "Java Lab",
                        content: `Java Programming Lab provides students with hands-on experience in Java programming. It includes topics such as object-oriented programming, data structures, GUI development, networking, and more.

Students are given problem statements and are required to write, test, and debug Java programs. Tools like Eclipse, NetBeans, or JDK are commonly used.

The lab focuses on coding, testing, debugging, and documentation, helping students build strong programming skills.`,
                    },

                    {
                        title: ".NET Lab",
                        content: `.NET Lab is a practical learning environment where students develop skills in technologies such as C#, ASP.NET, .NET Core, and other frameworks.

The lab includes projects, assignments, and exercises designed for different skill levels. Students gain experience in building real-world applications.

It also provides access to documentation, tutorials, and development tools to support learning and innovation.`,
                    },
                ];

                return (
                    <div className="space-y-12">

                        <h2 className="text-2xl font-bold text-blue-900">
                            Labs & Infrastructure
                        </h2>

                        {labs.map((lab, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-md p-6 space-y-6">

                                {/* TITLE */}
                                <h3 className="text-xl font-semibold text-blue-800 border-l-4 border-orange-500 pl-3">
                                    {lab.title}
                                </h3>

                                {/* IMAGE SPACE */}
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="h-44 bg-gray-200 rounded-lg flex items-center justify-center">Image</div>
                                    <div className="h-44 bg-gray-200 rounded-lg flex items-center justify-center">Image</div>
                                    <div className="h-44 bg-gray-200 rounded-lg flex items-center justify-center">Image</div>
                                </div>

                                {/* TEXT */}
                                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                    {lab.content}
                                </div>

                            </div>
                        ))}

                    </div>
                );
            case "Employment Opportunities":
                return (
                    <div className="space-y-6">

                        {/* CONTENT */}
                        <div className="bg-white shadow-md rounded-xl p-6 text-gray-700 text-sm leading-relaxed whitespace-pre-line">

                            {`With the exponential growth in the IT industry, BCA Jobs has witnessed a wide-scale growth not only in terms of revenue but also in employee retention. As per a report by Gartner, the computer software and hardware sector incurred a total FDI inflow worth USD 85.51 Billion between April 2000 to March 2022. BCA jobs are available across both government and private sectors.

With almost every industry using computer applications and software, there is a need for BCA Course graduates for almost every job. Some of the top most pursued BCA jobs include those of Data Scientist, Software Engineer, Software Developer, Web Developer, Computer Network Architect, Data Operator, Computer Programmer, Database Manager, and Web Analyst.

Top companies like Google, Microsoft, HCL, and TCS hire candidates for BCA jobs with an impressive starting salary of INR 10 LPA. However, on average, the starting salary for any BCA job usually ranges between INR 3.55 L – 5 L annually. BCA graduates have a starting salary of INR 35,000 – 50,000 per month in the Govt sector.

BCA graduates can expect to earn INR 3-6 LPA in the commercial sector and INR 15,000-35,000 per month in the government sector. After 5-19 years of experience, a BCA salary might range between INR 60,000 and 80,000 per month in the government sector and INR 7 lakhs to 1 crore in the private sector.`}

                        </div>

                    </div>
                );

            case "Clubs":
                const clubs = [
                    {
                        title: "Python Pirates",
                        desc: `Ever wondered there are so many programming languages but still everyone loves coding on Python? It’s because any person can understand Python even if he/she has no programming experience. Enroll your names now.`,
                    },
                    {
                        title: "C++ Mindscapes",
                        desc: `This club is known as C++ Mindscape and it introduces the programming guide specializing in C++ that you always wished you had access to when you started your coding journey.`,
                    },
                    {
                        title: "Java – The Coffee Guy",
                        desc: `Java is a class-based, high-level, object-oriented programming language designed to have as few implementation dependencies as possible. Java can be a great tool to keep in your toolbox to work in this world of techies. Don’t waste this chance and get your hand on java with our club THE COFFEE GUY. Without any further ado`,
                    },
                    {
                        title: "Web Designing (Web Wonders)",
                        desc: `Websites are the basic source on which we consume the internet. Web designing can give you a lot of opportunities if you are seeking any job in this field or might even build your own business/start-up. In our Web Designing club, you will learn and polish the required skills.`,
                    },
                    {
                        title: "Culture Promoting",
                        desc: `The country that we live in is known for its diverse culture. Diversity in food, clothing, language, and more. This club includes skits on various topics and art forms. You can participate and explore creativity. This club handles plays and cultural events in the college.`,
                    },
                    {
                        title: "Dance Club (Dance Palace)",
                        desc: `Got your feet tingling yet? Yes, that’s right — Dance Palace is the place to show off your moves. All dance events and activities are handled by this club.`,
                    },
                ];

                return (
                    <div className="space-y-8">

                        {/* HEADER */}
                        <h2 className="text-2xl font-bold text-blue-900">
                            Clubs & Activities
                        </h2>

                        {/* GRID */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {clubs.map((club, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition flex flex-col"
                                >

                                    {/* IMAGE SPACE */}
                                    <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                                        Image
                                    </div>

                                    {/* CONTENT */}
                                    <div className="p-5 flex flex-col flex-1">

                                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                            {club.title}
                                        </h3>

                                        <p className="text-sm text-gray-700 leading-relaxed flex-1">
                                            {club.desc}
                                        </p>

                                        {/* BUTTON */}
                                        <button className="mt-4 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition">
                                            View Events
                                        </button>

                                    </div>

                                </div>
                            ))}

                        </div>

                    </div>
                );
            case "Training & Placement":
                return <p className="text-gray-700">Placement and training details.</p>;

            case "Syllabus and Scheme of Study":
                const documents = [
                    "Value Added Courses under NEP 2020",
                    "Multidisciplinary Courses for UG Programs",
                    "Ability Enhancement Courses under NEP 2020",
                    "Scheme for 4-Year Bachelor of Computer Applications Program",
                    "BCA Syllabus",
                    "BCA Syllabus of 2025 Batch",
                ];

                return (
                    <div className="space-y-6">

                        {/* HEADER */}
                        <h2 className="text-2xl font-bold text-blue-900">
                            Academic Documents
                        </h2>

                        {/* LIST */}
                        <div className="bg-white rounded-xl shadow-md divide-y">

                            {documents.map((doc, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
                                >

                                    {/* TITLE */}
                                    <p className="text-gray-700 text-sm font-medium">
                                        {doc}
                                    </p>

                                    {/* BUTTON */}
                                    <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition">
                                        ⬇ Download
                                    </button>

                                </div>
                            ))}

                        </div>

                    </div>
                );

            case "Lecture Plan":
                const firstYear = [
                    "COA Lesson Plan",
                    "EES Lesson plan",
                    "English -I Lesson plan",
                    "Hindi Lesson Plan",
                    "IKS lesson plan",
                    "MFOC Lesson Plan",
                    "PS Lesson Plan",
                ];

                const secondYear = [
                    "DBMS Lesson_Plan",
                    "DHRI Lesson Plan",
                    "Eng -II Lesson plan",
                    "JAVA Lesson Plan",
                    "OOPS lesson plan",
                    "OS LESSON PLAN",
                ];

                const thirdYear = [
                    "CG Lesson Plan",
                    "DCN LESSON PLAN",
                    "MIS Lesson Plan",
                    "VB Lesson Plan",
                ];

                const Table1 = ({ title, data }) => (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">

                        {/* TITLE */}
                        <h3 className="text-lg font-semibold text-blue-900 px-6 py-3 border-b bg-gray-50">
                            {title}
                        </h3>

                        {/* TABLE */}
                        <table className="w-full text-sm text-left">

                            <thead className="bg-blue-900 text-white">
                                <tr>
                                    <th className="px-6 py-3">File Name</th>
                                    <th className="px-6 py-3 text-right">Download</th>
                                </tr>
                            </thead>

                            <tbody>
                                {data.map((item, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">

                                        <td className="px-6 py-3 text-gray-700">
                                            {item}
                                        </td>

                                        <td className="px-6 py-3 text-right">
                                            <button className="bg-orange-500 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-orange-600 transition">
                                                Download
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                );

                return (
                    <div className="space-y-8">

                        <h2 className="text-2xl font-bold text-blue-900">
                            Lecture Plan
                        </h2>

                        <Table1 title="1st Year" data={firstYear} />
                        <Table1 title="2nd Year" data={secondYear} />
                        <Table1 title="3rd Year" data={thirdYear} />

                    </div>
                );

            case "Previous Year’s MDU Question Papers":

                const subjects = [
                    {
                        title: "C Programming",
                        data: [
                            "BCA 2nd Sem April 2018",
                            "BCA 2nd Sem May 2019",
                            "BCA 2nd Sem May 2023",
                        ],
                    },
                    {
                        title: "Computer Graphics",
                        data: [
                            "BCA 5th Sem November 2014",
                            "BCA 5th Sem March 2021",
                            "BCA 5th Sem November 2017",
                            "BCA 5th Sem November 2018",
                            "BCA 5th Sem December 2019",
                        ],
                    },
                    {
                        title: "Communication Skills",
                        data: [
                            "BCA 3rd Sem November 2014",
                            "BCA 3rd Sem November 2016",
                            "BCA 3rd Sem March 2021",
                            "BCA 3rd Sem November 2017",
                            "BCA 3rd Sem November 2018",
                            "BCA 3rd Sem November 2019",
                        ],
                    },
                    {
                        title: "Computer and Programming Fundamentals",
                        data: [
                            "BCA 1st Sem November 2014",
                            "BCA 1st Sem March 2021",
                            "BCA 1st Sem November 2017",
                            "BCA 1st Sem December 2018",
                            "BCA 1st Sem December 2019",
                        ],
                    },
                    {
                        title: "Data Structure",
                        data: [
                            "BCA 3rd Sem November 2014",
                            "BCA 3rd Sem December 2016",
                            "BCA 3rd Sem March 2021",
                            "BCA 3rd Sem December 2017",
                            "BCA 3rd Sem December 2018",
                            "BCA 3rd Sem December 2019",
                        ],
                    },
                    {
                        title: "Data Base System",
                        data: [
                            "BCA 3rd Sem December 2014",
                            "BCA 3rd Sem December 2016",
                            "BCA 3rd Sem March 2021",
                            "BCA 3rd Sem December 2017",
                            "BCA 3rd Sem December 2018",
                            "BCA 3rd Sem December 2019",
                        ],
                    },
                    {
                        title: "Data Communication & Networking",
                        data: [
                            "BCA 5th Sem December 2017",
                            "BCA 5th Sem December 2018",
                            "BCA 5th Sem December 2019",
                        ],
                    },
                    {
                        title: "Mathematics",
                        data: [
                            "BCA 1st Sem December 2014",
                            "BCA 1st Sem March 2021",
                            "BCA 3rd Sem December 2016",
                            "BCA 1st Sem December 2017",
                            "BCA 1st Sem December 2018",
                            "BCA 1st Sem December 2019",
                        ],
                    },
                    {
                        title: "Management Information System",
                        data: [
                            "BCA 3rd Sem December 2014",
                            "BCA 5th Sem March 2021",
                            "BCA 5th Sem March 2021",
                            "BCA 5th Sem December 2017",
                            "BCA 5th Sem December 2018",
                            "BCA 5th Sem December 2019",
                        ],
                    },
                    {
                        title: "Operating System",
                        data: [
                            "BCA 3rd Sem December 2014",
                            "BCA 3rd Sem December 2016",
                            "BCA 3rd Sem March 2021",
                            "BCA 3rd Sem December 2017",
                            "BCA 3rd Sem December 2018",
                            "BCA 3rd Sem December 2019",
                            "MCA 3rd Sem December 2014",
                        ],
                    },
                    {
                        title: "Visual Basic",
                        data: [
                            "BCA 4th Sem December 2014",
                            "BCA 5th Sem December 2017",
                            "BCA 5th Sem December 2018",
                            "BCA 5th Sem December 2019",
                        ],
                    },
                ];

                const Table = ({ title, data }) => (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">

                        <h3 className="text-lg font-semibold text-blue-900 px-6 py-3 bg-gray-50 border-b">
                            {title}
                        </h3>

                        <table className="w-full text-sm">

                            <thead className="bg-blue-900 text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left">Title</th>
                                    <th className="px-6 py-3 text-right">Download</th>
                                </tr>
                            </thead>

                            <tbody>
                                {data.map((item, i) => (
                                    <tr key={i} className="border-b hover:bg-gray-50">

                                        <td className="px-6 py-3 text-gray-700">
                                            {item}
                                        </td>

                                        <td className="px-6 py-3 text-right">
                                            <button className="bg-orange-500 text-white px-3 py-1 rounded-md text-xs hover:bg-orange-600 transition">
                                                Download
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                );

                return (
                    <div className="space-y-8">

                        <h2 className="text-2xl font-bold text-blue-900">
                            Previous Year Question Papers
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {subjects.map((sub, index) => (
                                <Table key={index} title={sub.title} data={sub.data} />
                            ))}
                        </div>

                    </div>
                );

            case "Department Results and Toppers":

                const sem2 = [
                    { no: 1, subject: "C Programming", code: "BCA 106", topper: "MS. Hanu", marks: 91 },
                    { no: 2, subject: "Logical Organization of Computer-II", code: "BCA 107", topper: "MS. Hanu", marks: 72 },
                    { no: 3, subject: "Mathematical Foundations of Computer Science", code: "BCA 108", topper: "MS. Hanu", marks: 81 },
                    { no: 4, subject: "Structured System Analysis and Design", code: "BCA 109", topper: "MS. Hanu", marks: 90 },
                ];

                const sem4 = [
                    { no: 1, subject: "Web Designing", code: "BCA 206", topper: "NANDINI CHAUHAN", marks: 75 },
                    { no: 2, subject: "Data Structure-II", code: "BCA 207", topper: "HARI OM PANDEY", marks: 85 },
                    { no: 3, subject: "Object Oriented Programming using C++", code: "BCA 208", topper: "MANASVI MARWAHA / HARI OM PANDEY / PRIYANKA", marks: 65 },
                    { no: 4, subject: "Software Engineering", code: "BCA 209", topper: "MANASVI MARWAHA", marks: 81 },
                ];

                const sem6 = [
                    { no: 1, subject: "E-Commerce", code: "BCA 306", topper: "KANISHKA SAXENA", marks: 88 },
                    { no: 2, subject: "Object Technology and Programming using Java", code: "BCA 307", topper: "SHIVANI YADAV", marks: 85 },
                    { no: 3, subject: "Artificial Intelligence", code: "BCA 308", topper: "KANISHKA SAXENA", marks: 84 },
                    { no: 4, subject: "Introduction to .NET", code: "BCA 309", topper: "CHETAN BHARDWAJ", marks: 89 },
                ];

                const Table2 = ({ title, data }) => (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">

                        {/* TITLE */}
                        <h3 className="text-lg font-semibold text-blue-900 px-6 py-3 bg-gray-50 border-b">
                            {title}
                        </h3>

                        {/* TABLE */}
                        <table className="w-full text-sm">

                            <thead className="bg-blue-900 text-white">
                                <tr>
                                    <th className="px-4 py-3">S.No</th>
                                    <th className="px-4 py-3 text-left">Subject</th>
                                    <th className="px-4 py-3">Code</th>
                                    <th className="px-4 py-3 text-left">Topper</th>
                                    <th className="px-4 py-3">Marks</th>
                                </tr>
                            </thead>

                            <tbody>
                                {data.map((item, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">

                                        <td className="px-4 py-3 text-center">{item.no}</td>
                                        <td className="px-4 py-3 text-gray-700">{item.subject}</td>
                                        <td className="px-4 py-3 text-center">{item.code}</td>
                                        <td className="px-4 py-3">{item.topper}</td>
                                        <td className="px-4 py-3 text-center font-semibold text-blue-900">
                                            {item.marks}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>

                    </div>
                );

                return (
                    <div className="space-y-8">

                        <h2 className="text-2xl font-bold text-blue-900">
                            Department Results & Toppers
                        </h2>

                        <Table2 title="BCA 2nd Semester" data={sem2} />
                        <Table2 title="BCA 4th Semester" data={sem4} />
                        <Table2 title="BCA 6th Semester" data={sem6} />

                    </div>
                );

            default:
                return <p>Select an option</p>;
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-100">

            {/* NOTICE BOARD */}
            <div className="w-full h-12 flex items-center bg-white shadow-sm">
                <div className="bg-orange-500 text-white px-6 h-full flex items-center font-semibold text-lg">
                    Notice Board
                </div>
                <div className="flex-1 px-4 text-gray-600 text-sm overflow-hidden whitespace-nowrap">
                    <marquee behavior="scroll" direction="left">
                        Admissions Open 2026 • Semester Exams Schedule Released • Hackathon Registrations Live 🚀
                    </marquee>
                </div>
            </div>

            {/* HEADER */}
            <div className="w-full flex items-center justify-between px-6 py-4 bg-blue-900 shadow-md">

                {/* LEFT: LOGO */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white">
                        <img src={logo} alt="logo" className="w-full h-full object-cover" />
                    </div>

                    <div>
                        <h1 className="text-white font-bold text-xl leading-tight">
                            DPG Institute of Technology & Management
                        </h1>
                        <p className="text-gray-300 text-sm">
                            Approved by AICTE & Govt. of Haryana • Affiliated to MDU Rohtak
                        </p>
                    </div>
                </div>

                {/* RIGHT: BUTTONS + SEARCH */}
                <div className="flex items-center gap-4">

                    {/* SEARCH BAR */}
                    <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-sm">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="px-3 py-2 outline-none text-sm w-40"
                        />
                        <button className="bg-orange-500 text-white px-4 py-3 text-xl">
                            <IoSearch />
                        </button>
                    </div>

                    {/* BUTTONS */}
                    <button className="bg-yellow-400  text-blue-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition cursor-pointer">
                        Admission 2025
                    </button>

                    <button className="bg-yellow-400 cursor-pointer text-blue-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                        Apply Online
                    </button>

                    <button className="bg-white cursor-pointer text-blue-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                        Online Payment
                    </button>

                    <button className="bg-orange-500 cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition">
                        Student/Parent Login
                    </button>

                </div>
            </div>
            {/* NAVBAR */}
            <div className="w-full bg-blue-900 text-white shadow-md">
                <div className="max-w-7xl mx-auto flex items-center gap-6 px-6 py-3 text-sm font-medium">
                    <div className='cursor-pointer'>
                        Home
                    </div>

                    {/* ABOUT */}
                    <div className="relative group cursor-pointer">
                        <p>About</p>

                        <div className="absolute hidden group-hover:block bg-white text-black mt-2 rounded shadow-lg w-64 z-50">
                            <ul className="flex flex-col text-sm">
                                <li className="dropdown-item">About DPGITM</li>
                                <li className="dropdown-item">Why DPGITM</li>
                                <li className="dropdown-item">Mission & Vision</li>
                                <li className="dropdown-item">Board Of Governance</li>
                            </ul>
                        </div>
                    </div>

                    {/* MESSAGES */}
                    <div className="relative group cursor-pointer">
                        <p>Messages</p>

                        <div className="dropdown-menu">
                            <ul>
                                <li className="dropdown-item">Chairman’s Message</li>
                                <li className="dropdown-item">Managing Director’s Message</li>
                                <li className="dropdown-item">Director’s Message</li>
                            </ul>
                        </div>
                    </div>

                    {/* DEPARTMENTS */}
                    <div className="relative group cursor-pointer">
                        <p>Departments</p>

                        <div className="dropdown-menu w-72">
                            <ul>
                                <li className="dropdown-item font-semibold">Engineering</li>
                                <li className="dropdown-item">CSE</li>
                                <li className="dropdown-item">AI-ML & Data Science</li>
                                <li className="dropdown-item">ECE</li>
                                <li className="dropdown-item">Mechanical</li>
                                <li className="dropdown-item">Civil</li>
                                <li className="dropdown-item">Electrical</li>

                                <li className="dropdown-item font-semibold mt-2">Other</li>
                                <li className="dropdown-item">BCA</li>
                                <li className="dropdown-item">BBA</li>
                            </ul>
                        </div>
                    </div>

                    {/* COURSES */}
                    <div className="relative group cursor-pointer">
                        <p>Courses</p>

                        <div className="dropdown-menu w-72">
                            <ul>
                                <li className="dropdown-item font-semibold">B.Tech</li>
                                <li className="dropdown-item">CSE</li>
                                <li className="dropdown-item">AI & ML</li>
                                <li className="dropdown-item">Civil</li>
                                <li className="dropdown-item">Mechanical</li>

                                <li className="dropdown-item font-semibold mt-2">Others</li>
                                <li className="dropdown-item">BBA</li>
                                <li className="dropdown-item">BCA</li>

                                <li className="dropdown-item font-semibold mt-2">M.Tech</li>
                                <li className="dropdown-item">CSE</li>
                                <li className="dropdown-item">ECE</li>
                            </ul>
                        </div>
                    </div>

                    {/* CAMPUS */}
                    <div className="relative group cursor-pointer">
                        <p>Campus</p>

                        <div className="dropdown-menu">
                            <ul>
                                <li className="dropdown-item">Gallery</li>
                                <li className="dropdown-item">Infrastructure</li>
                                <li className="dropdown-item">Facilities</li>
                                <li className="dropdown-item">Library</li>
                                <li className="dropdown-item">Hostel</li>
                                <li className="dropdown-item">Sports</li>
                            </ul>
                        </div>
                    </div>

                    {/* PLACEMENTS */}
                    <div className="relative group cursor-pointer">
                        <p>Placements</p>

                        <div className="dropdown-menu">
                            <ul>
                                <li className="dropdown-item">Training & Placement Cell</li>
                                <li className="dropdown-item">Our Recruiters</li>
                                <li className="dropdown-item">Activities</li>
                                <li className="dropdown-item">Alumni</li>
                            </ul>
                        </div>
                    </div>

                    {/* RESOURCES */}
                    <div className="relative group cursor-pointer">
                        <p>Resources</p>

                        <div className="dropdown-menu">
                            <ul>
                                <li className="dropdown-item">Student Resources</li>
                                <li className="dropdown-item">Publications</li>
                                <li className="dropdown-item">Patents</li>
                                <li className="dropdown-item">IQAC</li>
                            </ul>
                        </div>
                    </div>

                    <div className='cursor-pointer'>
                        Contact us
                    </div>
                    <div className='cursor-pointer'>
                        Virohan
                    </div>

                </div>
            </div>

            <div className='w-full py-50 bg-gray-500 text-white flex justify-center items-center'>
                Add your image here
            </div>

            <div className="w-full min-h-screen bg-gray-100 flex">

                {/* LEFT SIDEBAR */}
                <div className="w-1/4 bg-white shadow-md border-r">

                    <h2 className="text-lg font-bold px-6 py-4 border-b bg-blue-900 text-white">
                        Department Menu
                    </h2>

                    <ul className="flex flex-col">
                        {menuItems.map((item) => (
                            <li
                                key={item}
                                onClick={() => setActive(item)}
                                className={`px-6 py-3 cursor-pointer text-sm border-b hover:bg-blue-200 transition 
              ${active === item ? "bg-blue-800 hover:bg-blue-800 text-white font-semibold" : "text-gray-700"}`}
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* RIGHT CONTENT */}
                <div className="w-3/4 p-6">

                    <div className="bg-white rounded-lg shadow-md p-6 min-h-[670px]">
                        <h2 className="text-xl font-bold mb-4 text-blue-900">
                            {active === "Overview" ? `Department ${active}` : `${active}`}
                        </h2>

                        {renderContent()}
                    </div>

                </div>

            </div>

            {/* TOP CONTACT BAR */}
            <div className="w-full bg-blue-900 text-white shadow-md">

                <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

                    {/* LEFT: LOGO + NAME */}
                    <div className="flex items-center gap-4">

                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white">
                            <img
                                src={logo}
                                alt="logo"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div>
                            <h1 className="text-lg font-bold leading-tight">
                                DPG Institute of Technology & Management
                            </h1>
                            <p className="text-xs text-gray-300">
                                Approved by AICTE & Govt. of Haryana • Affiliated to MDU Rohtak
                            </p>
                        </div>

                    </div>

                    {/* RIGHT: CONTACT INFO */}
                    <div className="hidden md:flex flex-col text-right text-sm gap-1">

                        <p> General Inquiry: +91-9211726982</p>
                        <p>📧 info@dpgitm.ac.in</p>
                        <p>🎓 Admissions: +91-9211726982</p>
                        <p>💼 T&P: +91-9810048765</p>

                    </div>

                </div>

            </div>

            <footer className="bg-blue-950 text-gray-300 pt-10">

                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">

                    {/* COLUMN 1 - INSTITUTE */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Institute</h3>
                        <ul className="space-y-2 text-sm">
                            <li>About Us</li>
                            <li>Admission Procedure</li>
                            <li>Courses</li>
                            <li>Gallery</li>
                            <li>Academic Calendar 25-26</li>
                            <li>DPGITM List of Holidays</li>
                            <li>Mandatory Disclosure</li>
                            <li>Careers</li>
                            <li>Grievance Redressal Staff</li>
                        </ul>
                    </div>

                    {/* COLUMN 2 - ACADEMICS */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Academics</h3>
                        <ul className="space-y-2 text-sm">
                            <li>Civil Engineering</li>
                            <li>Computer Science & Engineering</li>
                            <li>Electrical Engineering</li>
                            <li>Mechanical Engineering</li>
                            <li>Applied Science</li>
                            <li>Business Administration</li>
                            <li>Electronics & Communication Engineering</li>
                        </ul>
                    </div>

                    {/* COLUMN 3 - QUICK LINKS */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>Admission 2025 Brochure</li>
                            <li>Admissions 2025</li>
                            <li>Faculty Login</li>
                            <li>Code of Conduct</li>
                            <li>AICTE</li>
                            <li>UGC</li>
                            <li>HSTES</li>
                            <li>MDU Rohtak</li>
                        </ul>
                    </div>

                    {/* COLUMN 4 - CONTACT */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact Us</h3>

                        <p className="text-sm leading-relaxed">
                            DPGITM <br />
                            Near Hero Honda, Behind Marble Market, <br />
                            Sector - 34, Gurgaon (Delhi-NCR), <br />
                            Haryana - 122004, India
                        </p>

                        <button className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition">
                            View On Map
                        </button>

                        <div className="mt-4 space-y-2">
                            <button className="w-full bg-white text-blue-900 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                                Download Student App
                            </button>

                            <button className="w-full bg-white text-blue-900 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                                Download DPGITM App
                            </button>
                        </div>
                    </div>

                </div>

                {/* BOTTOM */}
                <div className="border-t border-gray-700 mt-8 py-4 text-center text-sm text-gray-400">
                    © 2026. dpgitm.ac.in | All Rights Reserved
                </div>

            </footer>


        </div>
    )
}

export default BcaPage