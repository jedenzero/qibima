import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import { Routes, Route, Link, useParams, Navigate, useNavigate } from "react-router-dom";
import Papa from "papaparse";
import MarkdownIt from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";
import markdownItMultimdTable from "markdown-it-multimd-table";
import markdownItContainer from "markdown-it-container";
import BookSharpIcon from '@mui/icons-material/BookSharp';
import QuizSharpIcon from '@mui/icons-material/QuizSharp';
import ArrowBackSharpIcon from '@mui/icons-material/ArrowBackSharp';
import WorkspacePremiumSharpIcon from '@mui/icons-material/WorkspacePremiumSharp';

export const Context = createContext(null);

export default function App() {
    const [currentCourse, setCurrentCourse] = useState(localStorage.getItem("현재 과정"));
    const [courses, setCourses] = useState([]);
    const [course, setCourse] = useState([]);
    
    useEffect(() => {
        async function loadCourses(){
            const response = await fetch("https://docs.google.com/spreadsheets/d/1CcvbnqTOcHrr6l8u1BooDwIwbu6g7HNYbGHsPeVgOUk/export?format=csv&gid=0");
            const text = await response.text();
            setCourses(Papa.parse(text, { header: true }).data.sort((a, b) => a['출발어'].localeCompare(b['출발어'])));
        }
        
        loadCourses();
    }, []);
    
    return(
        <Context.Provider value={{ currentCourse, setCurrentCourse, courses, course, setCourse}}>
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
                        : <ChooseFirstCourse />
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
                    path="/:courseCode/:stepName/lesson"
                    element={
                        currentCourse
                        ? <Lesson />
                        : <Navigate to="/first" replace />
                    }
                />
                <Route
                    path="/:courseCode/:stepName/test"
                    element={
                        currentCourse
                        ? <Test />
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
                    path="*"
                    element={
                        currentCourse
                        ? <Navigate to={`/${currentCourse}`} replace />
                        : <Navigate to="/first" replace />
                    }
                />
            </Routes>
        </Context.Provider>
    );
}

function ChooseFirstCourse(){
    const navigate = useNavigate();
    const { currentCourse, setCurrentCourse, courses } = useContext(Context);
    
    return(
        <>
            <div id="passage">처음으로 배울 언어를 선택하세요.</div>
            {courses.map((el, index) => (
                <React.Fragment key={index}>
                    {(index ==0 || el['출발어'] !== courses[index - 1]['출발어']) && <div className="section">{el['출발어']}</div>}
                    <div className="course" onClick={() => {localStorage.setItem("현재 과정", el['코드']); setCurrentCourse(`${el['코드']}`); navigate(`/${el['코드']}`)}}><img src={`/assets/flags/${el['코드'].split('-')[1]}.svg`} className="language-flag" alt={`${el['도착어']}의 상징기`} />{el['도착어']}</div>
                </React.Fragment>
            ))}
        </>
    );
}

function CourseHome(){
    const navigate = useNavigate();
    const courseCode = useParams()['courseCode'];
    const { currentCourse, courses, setCourse } = useContext(Context);
    
    if(!courses) return <div>불러오는 중...</div>;
    
    const courseInfo = courses.find(el => el['코드'] == currentCourse);
    const [courseTitles, setCourseTitles] = useState([]);
    
    useEffect(() => {
        if(currentCourse !== courseCode){
            navigate("/");
        }
    }, [currentCourse, courseCode, navigate]);
    
    useEffect(() => {
        async function loadCourse(){
            const response = await fetch(courseInfo['링크']);
            const text = await response.text();
            const parsed = Papa.parse(text, { header: true }).data;
            setCourse(parsed);
            let titles = []
            parsed.forEach((row, index) => {
                const prev = parsed[index-1];
                if(index == 0 || row['단계'] != prev['단계'] || row['단원'] != prev['단원']){
                    titles.push({단원: row['단원'], 단계: row['단계']});
                }
            });
            setCourseTitles(titles);
        }
        loadCourse();
    }, [courseInfo]);
    
    return(
        <>
            <div id="header">
                <img src={`/assets/flags/${courseInfo['코드'].split('-')[1]}.svg`} className="language-flag" alt={`${courseInfo['도착어']}의 상징기`} />
            </div>
            <div id="content">
                {courseTitles.map((el, index)=>
                    <React.Fragment key={index}>
                        {(index == 0 || el['단원'] !== courseTitles[index - 1]['단원']) && <div className="section">{el['단원']}</div>}
                        <div className="step">{el['단계']}<BookSharpIcon className="lesson" onClick={() => navigate(`/${currentCourse}/${el['단계']}/lesson`)} /><QuizSharpIcon className="test" onClick={() => navigate(`/${currentCourse}/${el['단계']}/test`)} /></div>
                    </React.Fragment>
                )}
            </div>
        </>
    );
}

function Lesson(){
    return(
        <>
        </>
    );
}

function Test(){
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