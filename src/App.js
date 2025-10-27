 import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import { Routes, Route, Link, useParams, Navigate, useNavigate } from "react-router-dom";
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
    const [courses, setCourses] = useState(null);
    const [course, setCourse] = useState(null);
    const [stepNames, setStepNames] = useState([]);
    
    useEffect(() => {
        async function loadCourses(){
            const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/1CcvbnqTOcHrr6l8u1BooDwIwbu6g7HNYbGHsPeVgOUk/values/코드%20목록?key=${process.env.REACT_APP_GSHEET_API_KEY}`);
            const data = await response.json();
            const tags = data.values[0];
            const parsed = data.values.slice(1).map(row => {
                let obj = {};
                row.forEach((el, index) => {
                    obj[tags[index]] = el;
                });
                return obj;
            });
            setCourses(parsed.sort((a, b) => a['출발어'].localeCompare(b['출발어'])));
        }
        
        loadCourses();
    }, []);
    
    if(!courses) return <div>불러오는 중...</div>;
    
    return(
        <Context.Provider value={{ currentCourse, setCurrentCourse, courses, course, setCourse, stepNames, setStepNames}}>
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
                        currentCourse && course
                        ? <Lesson />
                        : <Navigate to="/" replace />
                    }
                />
                <Route
                    path="/:courseCode/:stepName/test"
                    element={
                        currentCourse && course
                        ? <Test />
                        : <Navigate to="/" replace />
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
                    <div className="course" onClick={() => {localStorage.setItem("현재 과정", el['코드']); setCurrentCourse(`${el['코드']}`); navigate(`/${el['코드']}`)}}><img src={`/public/imgs/flags/${el['코드'].split('-')[1]}.svg`} className="language-flag" alt={`${el['도착어']}의 상징기`} />{el['도착어']}</div>
                </React.Fragment>
            ))}
        </>
    );
}

function CourseHome(){
    const navigate = useNavigate();
    const courseCode = useParams()['courseCode'];
    const { currentCourse, courses, course, setCourse, stepNames, setStepNames } = useContext(Context);
    const courseInfo = courses ? courses.find(el => el['코드'] == courseCode) : null;
    
    useEffect(() => {
        if(!currentCourse) return;
        
        if(currentCourse !== courseCode){
            navigate("/");
        }
    }, [currentCourse, courseCode, navigate]);
    
    useEffect(() => {
        if(!courseInfo || stepNames.length !== 0) return;
        
        async function loadCourse(){
            const response = await fetch(`${courseInfo['링크']}?key=${process.env.REACT_APP_GSHEET_API_KEY}`);
            const data = await response.json();
            const tags = data.values[0];
            const parsed = data.values.slice(1).map(row => {
                let obj = {};
                row.forEach((el, index) => {
                    obj[tags[index]] = el;
                });
                return obj;
            });
            setCourse(parsed);
            let names = []
            parsed.forEach((row, index) => {
                const prev = parsed[index-1];
                if(index == 0 || row['단계'] != prev['단계'] || row['단원'] != prev['단원']){
                    names.push({단원: row['단원'], 단계: row['단계']});
                }
            });
            setStepNames(names);
        }
        loadCourse();
    }, [courseInfo]);
    
    if(!course || !courseInfo || stepNames.length === 0){
        return <div>불러오는 중...</div>;
    }
    
    return(
        <>
            <div id="header">
                <img src={`/public/imgs/flags/${courseInfo['코드'].split('-')[1]}.svg`} className="language-flag" alt={`${courseInfo['도착어']}의 상징기`} />
            </div>
            <div id="content">
                {stepNames.map((el, index)=>
                    <React.Fragment key={index}>
                        {(index == 0 || el['단원'] !== stepNames[index - 1]['단원']) && <div className="section">{el['단원']}</div>}
                        <div className="step">{el['단계']}<BookSharpIcon className="lesson" onClick={() => navigate(`/${currentCourse}/${el['단원']}-${el['단계']}/lesson`)} /><QuizSharpIcon className="test" onClick={() => navigate(`/${currentCourse}/${el['단원']}-${el['단계']}/test`)} /></div>
                    </React.Fragment>
                )}
            </div>
        </>
    );
}

function Lesson(){
    const navigate = useNavigate();
    const { courseCode, stepName } = useParams();
    const { currentCourse, course } = useContext(Context);
    
    useEffect(() => {
        if(!currentCourse) return;
        
        if(currentCourse !== courseCode){
            navigate("/");
        }
    }, [currentCourse, courseCode, navigate]);
    
    if(!course){
        return <div>불러오는 중...</div>;
    }
    
    return(
        <>
            <div id="header">
                <ArrowBackSharpIcon id="back" onClick={() => navigate(`/${courseCode}`)} />
                <div>{stepName}</div>
            </div>
            <div id="content">
                {
                    md.render(course.find(el => 
                    el['유형'] == '설명' && 
                    el['단원'] == stepName.split('-')[0] && 
                    el['단계'] == stepName.split('-')[1])?.['설명'] ?? "이 단계는 설명이 없습니다.")
                }
            </div>
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
