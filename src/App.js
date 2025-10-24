import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useParams, Navigate, useNavigate } from "react-router-dom";
import Papa from "papaparse";
import MarkdownIt from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";
import markdownItMultimdTable from "markdown-it-multimd-table";
import markdownItContainer from "markdown-it-container";

export default function App() {
    const [currentCourse, setCurrentCourse] = useState(localStorage.getItem("현재 과정"));
    const [courses, setCourses] = useState([]);
    
    useEffect(() => {
        async function loadCourses(){
            const response = await fetch("https://docs.google.com/spreadsheets/d/1CcvbnqTOcHrr6l8u1BooDwIwbu6g7HNYbGHsPeVgOUk/export?format=csv&gid=0");
            const text = await response.text();
            setCourses(Papa.parse(text, { header: true }).data.sort((a, b) => a['출발어'].localeCompare(b['출발어'])));
        }
        
        loadCourses();
    }, []);
    
    return(
        <>
            <Routes>
                <Route
                    path="/"
                    element={
                        currentCourse
                        ? <Navigate to={`/${currentCourse}`} replace />
                        : <Navigate to="/first" replace />
                    }
                />
                <Route
                    path="/first"
                    element={
                        currentCourse
                        ? <Navigate to={`/${currentCourse}`} replace />
                        : <ChooseFirstCourse currentCourse={currentCourse} setCurrentCourse={setCurrentCourse} courses={courses} />
                    }
                />
                <Route
                    path="/:courseCode"
                    element={
                        currentCourse
                        ? <CourseHome />
                        : <Navigate to="/first" replace />
                    }
                />
                <Route
                    path="/add"
                    element={
                        currentCourse
                        ? <AddCourse />
                        : <Navigate to="/first" replace />
                    }
                />
                <Route
                    path="/switch"
                    element={
                        currentCourse
                        ? <SwitchCourse />
                        : <Navigate to="/first" replace />
                    }
                />
                <Route
                    path="/:courseCode"
                    element={
                        currentCourse
                        ? <CourseHome />
                        : <Navigate to="/first" replace />
                    }
                />
            </Routes>
        </>
    );
}

function ChooseFirstCourse({ currentCourse, setCurrentCourse, courses }){
    const navigate = useNavigate();
    
    return(
        <>
            <div id="passage">처음으로 배울 언어를 선택하세요.</div>
            {courses.map((course, index) => (
                <React.Fragment key={index}>
                    {(index == 0 || course['출발어'] !== courses[index - 1]['출발어']) && <div className="section">{course['출발어']}</div>}
                    <div className="course" onClick={() => {localStorage.setItem("현재 과정", course['코드']); setCurrentCourse(`${course['코드']}`); navigate(`/${course['코드']}`)}}><img src={`/assets/${course['코드']}.svg`} className="language-flag" alt={`${course['도착어']}의 상징기`} />{course['도착어']}</div>
                </React.Fragment>
            ))}
        </>
    );
}

function CourseHome(){
    return(
        <>
        </>
    );
}

function AddCourse(){
    return(
        <>
        </>
    );
}

function SwitchCourse(){
    return(
        <>
        </>
    );
}