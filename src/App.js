import React, { useState, useEffect, useRef, createContext, useContext, useMemo, useCallback } from "react";
import { Routes, Route, Link, useParams, Navigate, useNavigate } from "react-router-dom";
import MarkdownIt from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";
import markdownItMultimdTable from "markdown-it-multimd-table";
import markdownItContainer from "markdown-it-container";
import BookRoundedIcon from '@mui/icons-material/BookRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChangeCircleRoundedIcon from '@mui/icons-material/ChangeCircleRounded';

export const Context = createContext(null);

export default function App() {
    const [currentCourse, setCurrentCourse] = useState(localStorage.getItem("현재 과정"));
    const [storageData, setStorageData] = useState(() => {
        return currentCourse ? JSON.parse(localStorage.getItem(currentCourse)) ?? {} : {};
    });
    const [courses, setCourses] = useState(null);
    const courseInfo = useMemo(() => {
        return currentCourse && courses ? courses.find(el => el['코드'] == currentCourse) : null;
    }, [courses, currentCourse]);
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
            setCourses(parsed);
        }
        
        loadCourses();
    }, []);
    
    useEffect(() => {
        if(courses && currentCourse && !courses.some(row => row['코드'] == currentCourse)){
            localStorage.removeItem("현재 과정");
            setCurrentCourse(null);
        }
    }, [courses, currentCourse]);
    
    if(!courses) return <div>불러오는 중...</div>;
    
    return(
        <Context.Provider value={{ currentCourse, setCurrentCourse, courses, courseInfo, course, setCourse, stepNames, setStepNames, storageData}}>
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
            <div id="brand-header">
                <img src="/imgs/logo_navy.svg" id="logo" alt="키비마의 로고" />
            </div>
            <div id="content">
                <div id="passage">처음으로 배울 언어는</div>
                {courses.map((el, index) => (
                    <React.Fragment key={index}>
                        {(index ==0 || el['출발어'] !== courses[index - 1]['출발어']) && <div className="section">{el['출발어']}</div>}
                        <div className="course" onClick={() => {localStorage.setItem("현재 과정", el['코드']); setCurrentCourse(`${el['코드']}`); navigate(`/${el['코드']}`)}}><img src={`/imgs/flags/${el['코드'].split('-')[1]}.svg`} className="language-flag" alt={`${el['도착어']}의 상징기`} />{el['도착어']}</div>
                    </React.Fragment>
                ))}
            </div>
        </>
    );
}

function CourseHome(){
    const navigate = useNavigate();
    const courseCode = useParams()['courseCode'];
    const { currentCourse, courses, courseInfo, course, setCourse, stepNames, setStepNames } = useContext(Context);
    
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
            <div id="home-header">
                <img src={`/imgs/flags/${courseInfo['코드'].split('-')[1]}.svg`} className="language-flag" alt={`${courseInfo['도착어']}의 상징기`} />
                <div className="icon-container">
                    <AddRoundedIcon className="add" onClick={() => navigate('/add')}/>
                    <ChangeCircleRoundedIcon className="switch" onClick={() => navigate('/switch')}/>
                </div>
            </div>
            <div id="content">
                {stepNames.map((el, index)=>
                    <React.Fragment key={index}>
                        {(index == 0 || el['단원'] !== stepNames[index - 1]['단원']) && <div className="section">{el['단원']}</div>}
                        <div className="step">{el['단계']}<div className="icon-container"><BookRoundedIcon className="lesson" onClick={() => navigate(`/${currentCourse}/${el['단원']}-${el['단계']}/lesson`)} /><AssignmentRoundedIcon className="test" onClick={() => navigate(`/${currentCourse}/${el['단원']}-${el['단계']}/test`)} /></div></div>
                    </React.Fragment>
                )}
            </div>
        </>
    );
}

function Lesson(){
    const navigate = useNavigate();
    const { courseCode, stepName } = useParams();
    const { currentCourse, course, storageData } = useContext(Context);
    const md = new MarkdownIt()
    .use(markdownItFootnote)
    .use(markdownItContainer)
    .use(markdownItMultimdTable);
    
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
            <div id="sub-header">
                <ArrowBackRoundedIcon id="back" onClick={() => navigate(`/${courseCode}`)} />
                <div id="header-text">{stepName}</div>
            </div>
            <div id="content"
                dangerouslySetInnerHTML={{
                    __html: md.render(course.find(el => 
                    el['유형'] == '설명' && 
                    el['단원'] == stepName.split('-')[0] && 
                    el['단계'] == stepName.split('-')[1])?.['설명'] ?? "이 단계는 설명이 없습니다.")
                }}
            />
        </>
    );
}

function Test(){
    const navigate = useNavigate();
    const { courseCode, stepName } = useParams();
    const { currentCourse, courseInfo, course, storageData } = useContext(Context);
    const UI = courseInfo['UI'] ? JSON.parse(courseInfo['UI']) : {};
    const [testWords, setTestWords] = useState([]);
    const [testSentences, setTestSentences] = useState([]);
    const [count, setCount] = useState(null);
    const [type, setType] = useState(null);
    const [blankSentence, setBlankSentence] = useState("");
    const [options, setOptions] = useState([]);
    const [pieces, setPieces] = useState([]);
    const [inputs, setInputs] = useState([]);
    const [answer, setAnswer] = useState("");
    const [input, setInput] = useState("");
    const [isCorrect, setIsCorrect] = useState(null);
    const [isCorrectArr, setIsCorrectArr] = useState([]);
    const [correct, setCorrect] = useState(0);
    const [next, setNext] = useState(false);
    const [passageContent, setPassageContent] = useState(null);
    const [footButtonContent, setFootButtonContent] = useState(null);
    
    const areaRef = useRef(null);
    
    function check(){
        if(type == '출발어 단어 단답형' || type == '도착어 단어 단답형'){
            if(answer.trim() === input.trim()){
                setCorrect(prev => prev+1);
                setIsCorrect(true);
            }
            else{
                setIsCorrect(false);
            }
        }
        if(type == '출발어 문장 서답형' || type == '도착어 문장 서답형'){
            if(answer.trim().replace(/[\-.,?!:~"'‘’“”«»]/g, '') === input.trim().replace(/[\-.,?!:~"'‘’“”«»]/g, '')){
                setCorrect(prev => prev+1);
                setIsCorrect(true);
            }
            else{
                setIsCorrect(false);
            }
        }
        if(type == '도착어 단어 선지형'){
            if(answer == input){
                setCorrect(prev => prev+1);
                setIsCorrect(true);
            }
            else{
                setIsCorrect(false);
            }
        }
        if(type == '출발어 문장 조합형' || type == '도착어 문장 조합형'){
            let isCorrectTemp = true;
            let arrTemp = [];
            
            inputs.forEach((row, index) => {
                if(answer.length <= index){
                    isCorrectTemp = false;
                    arrTemp.push(false);
                }
                else{
                    if(row[1] == answer[index]){
                        arrTemp.push(true);
                    }
                    else{
                        isCorrectTemp = false;
                        arrTemp.push(false);
                    }
                }
            });
            
            if(inputs.length == 0){
                isCorrectTemp = false;
            }
            
            setIsCorrect(isCorrectTemp);
            setIsCorrectArr(arrTemp);
        }
    }
    
    useEffect(() => {
        if(!currentCourse) return;
        
        if(currentCourse !== courseCode){
            navigate("/");
        }
    }, [currentCourse, courseCode, navigate]);
    
    if(!course){
        return <div>불러오는 중...</div>;
    }
    
    useEffect(() => {
        const currentIndex = course.findIndex(row => `${row['단원']}-${row['단계']}` == stepName);
        const latestIndex = storageData['마지막 단계'] ? course.findIndex(row => `${row['단원']}-${row['단계']}` == storageData['마지막 단계']) : -1;
        let words = [];
        
        if(currentIndex > latestIndex){
            words = course.filter(row =>
                row['단원'] == stepName.split('-')[0] &&
                row['단계'] == stepName.split('-')[1] &&
            row['유형'] == '단어')
            .sort(() => Math.random() - 0.5);
            setTestWords(words);
        }
        const sentences = course.filter(row =>
            row['단원'] == stepName.split('-')[0] &&
            row['단계'] == stepName.split('-')[1] &&
        row['유형'] == '문장')
        .sort(() => Math.random() - 0.5)
        .slice(0, 15-words.length);
        setTestSentences(sentences);
    }, [storageData, stepName]);
    
    useEffect(() => {
        if(count == null && (testWords.length != 0 || testSentences.length != 0)){
            setCount(0);
        }
    }, [testWords, testSentences]);
    
    useEffect(() => {
        if(count == null || testSentences.length == 0) return;
        
        if(count < testWords.length){
            setPassageContent(UI['memo-word']);
        }
        else if(count >= testWords.length && count < testWords.length + testSentences.length){
            const randomRange = Math.floor(Math.random() * 15);
            const randomLanguage = Math.floor(Math.random() * 3);
            const randomType = Math.floor(Math.random() * 2);
            
            if(randomRange > count){
                //범위: 단어
                if(randomLanguage == 0){
                    //출발어(번역문) 단답형
                    const blankWords = testSentences[count-testWords.length]['문장 뜻 빈칸'].match(/\[([^\[\]]+)\]/g);
                    const randomWord = blankWords[Math.floor(Math.random() * blankWords.length)];
                    const regex = new RegExp(`(${randomWord.replace(/([\[\]])/g, '\\$1')})`);
                    
                    setBlankSentence(testSentences[count-testWords.length]['문장 뜻 빈칸'].replace(regex, '<span class="blank">$1</span>').replace(/\[([^\[\]]+)\]/g, '$1'));
                    setAnswer(randomWord.replace(/([\[\]])/g, ''));
                    setPassageContent(UI['write-word']);
                    setType('출발어 단어 단답형');
                }
                else{
                    //도착어
                    if(randomType == 0){
                        //선지형
                        const blankWords = testSentences[count-testWords.length]['문장 빈칸'].match(/\[([^\[\]]+)\]/g);
                        const randomWordBracket = blankWords[Math.floor(Math.random() * blankWords.length)];
                        const regex = new RegExp(`(${randomWordBracket.replace(/([\[\]])/g, '\\$1')})`);
                        const randomWord = randomWordBracket.replace(/([\[\]])/g, '');
                        let optionWords = [];
                        
                        for (const [index, row] of course.entries()){
                            const prev = course[index-1] || row;
                            if((row['단원'] != stepName.split('-')[0] || row['단계'] != stepName.split('-')[1]) &&
                            prev['단원'] == stepName.split('-')[0] && prev['단계'] == stepName.split('-')[1]) break;
                            if(row['유형'] == '단어' && row['단어'] != randomWord){
                                optionWords.push(row['단어']);
                            }
                        }
                        
                        optionWords = optionWords.sort(() => Math.random() - 0.5).slice(0, 2);
                        optionWords.push(randomWord);
                        
                        setBlankSentence(testSentences[count-testWords.length]['문장 빈칸'].replace(regex, '<span class="blank">$1</span>').replace(/\[([^\[\]]+)\]/g, '$1'));
                        setOptions(optionWords.sort(() => Math.random() - 0.5));
                        setAnswer(randomWord);
                        setPassageContent(UI['select-word']);
                        setType('도착어 단어 선지형');
                    }
                    else{
                        //단답형
                        const blankWords = testSentences[count-testWords.length]['문장 빈칸'].match(/\[([^\[\]]+)\]/g);
                        const randomWord = blankWords[Math.floor(Math.random() * blankWords.length)];
                        const regex = new RegExp(`(${randomWord.replace(/([\[\]])/g, '\\$1')})`);
                        
                        setBlankSentence(testSentences[count-testWords.length]['문장 빈칸'].replace(regex, '<span class="blank">$1</span>').replace(/\[([^\[\]]+)\]/g, '$1'));
                        setAnswer(randomWord.replace(/([\[\]])/g, ''));
                        setPassageContent(UI['write-word']);
                        setType('도착어 단어 단답형');
                    }
                }
            }
            else{
                //범위: 문장
                if(randomLanguage == 0){
                    //출발어
                    if(randomType == 0){
                        //조합형
                        let piecesTemp = testSentences[count-testWords.length]['문장 뜻 분해'].split('|');

                        setAnswer(piecesTemp);
                        setPieces(piecesTemp.sort(() => Math.random() - 0.5));
                        setPassageContent(UI['make-sentence-start']);
                        setType('출발어 문장 조합형');
                    }
                    else{
                        //서답형
                        setAnswer(testSentences[count-testWords.length]['문장 뜻']);
                        setPassageContent(UI['write-sentence']);
                        setType('출발어 문장 서답형');
                    }
                }
                else{
                    //도착어
                    if(randomType == 0){
                        //조합형
                         let piecesTemp = testSentences[count-testWords.length]['문장 분해'].split('|');

                        setAnswer(piecesTemp);
                        setPieces(piecesTemp.sort(() => Math.random() - 0.5));
                        setPassageContent(UI['make-sentence-target']);
                        setType('도착어 문장 조합형');
                    }
                    else{
                        //서답형
                        setAnswer(testSentences[count-testWords.length]['문장']);
                        setPassageContent(UI['write-sentence']);
                        setType('도착어 문장 서답형');
                    }
                }
            }
        }
        else{
            
        }
    }, [count, testWords, testSentences]);
    
    useEffect(() => {
        setFootButtonContent(next ? UI['next'] : UI['check']);
        if(next == false && areaRef.current){
            areaRef.current.value = "";
        }
    }, [next]);
    
    useEffect(() => {
        setInput('');
    }, [count]);
    
    return(
        <>
            <div id="sub-header">
                <ArrowBackRoundedIcon id="back" onClick={() => navigate(`/${courseCode}`)} />
                <div id="header-text">{stepName}</div>
            </div>
            <div id="progress-bar">
                <div id="progress-bar-fill" style={{width: count ? `${(count/15)*100}%` : '0'}}></div>
            </div>
            <div id="content">
                <div id="passage">{passageContent}</div>
                {type == null &&
                    <>
                        <div id="static-card">
                            <div id="word">{testWords?.[count]?.['단어'] || ''}</div>
                            <div id="meaning">{testWords?.[count]?.['단어 뜻'] || ''}</div>
                        </div>
                        <div id="option-container"></div>
                    </>
                }
                {type == '출발어 단어 단답형' &&
                    <>
                    <div id="static-card" className={`${next ? 'reveal' : ''}`}>
                        <div id="sentence">{testSentences[count-testWords.length]['문장']}</div>
                        <div id="meaning" dangerouslySetInnerHTML={{ __html: blankSentence }}></div>
                    </div>
                    <textarea id="writing-area" ref={areaRef} className={`${next ? isCorrect ? 'correct' : 'incorrect' : ''}`} onChange={(e) => setInput(e.target.value)} readOnly={next}></textarea>
                    </>
                }
                {type == '도착어 단어 단답형' &&
                    <>
                    <div id="static-card" className={`${next ? 'reveal' : ''}`}>
                        <div id="sentence" dangerouslySetInnerHTML={{ __html: blankSentence }}></div>
                        <div id="meaning">{testSentences[count-testWords.length]['문장 뜻']}</div>
                    </div>
                    <textarea id="writing-area" ref={areaRef} className={`${next ? isCorrect ? 'correct' : 'incorrect' : ''}`} onChange={(e) => setInput(e.target.value)} readOnly={next}></textarea>
                    </>
                }
                {type == '도착어 단어 선지형' &&
                    <>
                    <div id="static-card" className={`${next ? 'reveal' : ''}`}>
                        <div id="sentence" dangerouslySetInnerHTML={{ __html: blankSentence }}></div>
                        <div id="meaning">{testSentences[count-testWords.length]['문장 뜻']}</div>
                    </div>
                    <div id="option-container">
                        {options.map(el =>
                            <div key={el} className={`option${(next == false && el == input) || (next == true && el != answer && el == input) ? ' selected' : ''}${next == true && el == answer ? ' correct' : ''}`} onClick={() => {if(next == false){setInput(el)}}}>{el}</div>
                        )}
                    </div>
                    </>
                }
                {type == '출발어 문장 서답형' &&
                    <>
                    <div id="static-card" className={`${next ? 'reveal' : ''}`}>
                        <div id="sentence">{testSentences[count-testWords.length]['문장']}</div>
                        <div id="meaning"><span className="blank">{testSentences[count-testWords.length]['문장 뜻']}</span></div>
                    </div>
                    <textarea id="writing-area" ref={areaRef} className={`${next ? isCorrect ? 'correct' : 'incorrect' : ''}`} onChange={(e) => setInput(e.target.value)} readOnly={next}></textarea>
                    </>
                }
                {type == '도착어 문장 서답형' &&
                    <>
                    <div id="static-card" className={`${next ? 'reveal' : ''}`}>
                        <div id="sentence"><span className="blank">{testSentences[count-testWords.length]['문장']}</span></div>
                        <div id="meaning">{testSentences[count-testWords.length]['문장 뜻']}</div>
                    </div>
                    <textarea id="writing-area" ref={areaRef} className={`${next ? isCorrect ? 'correct' : 'incorrect' : ''}`} onChange={(e) => setInput(e.target.value)} readOnly={next}></textarea>
                    </>
                }
                {type == '출발어 문장 조합형' &&
                    <>
                    <div id="card-container">
                        <div id="variable-card">
                            {testSentences[count-testWords.length]['문장']}
                        </div>
                        <div id="input-container">
                            {inputs.map((row, index) =>
                                <span key={row[0]} className={`${next == true ? isCorrectArr[index] == true ? 'correct' : 'incorrect' : ''}`}>{row[1]}</span>
                            )}
                        </div>
                    </div>
                    <div id="piece-container">
                        {pieces.map((el, index) =>
                            <div key={index} className={`piece${inputs.some(row => row[0] == index) ? ' selected': ''}`} 
                                onClick={() => {
                                if(next == true) return;
                                if(inputs.some(row => row[0] == index)){
                                    setInputs(prev => prev.filter(row => row[0] != index));
                                }
                                else{
                                    setInputs(prev => [...prev, [index, el]]);
                                }
                                }}>{el}
                            </div>
                        )}
                    </div>
                    </>
                }
                {type == '도착어 문장 조합형' &&
                    <>
                    <div id="card-container">
                        <div id="variable-card">
                            {testSentences[count-testWords.length]['문장 뜻']}
                        </div>
                        <div id="input-container">
                            {inputs.map((row, index) =>
                                <span key={row[0]} className={`piece${next == true ? isCorrectArr[index] == true ? 'correct' : ' incorrect' : ''}`}>{row[1]}</span>
                            )}
                        </div>
                    </div>
                    <div id="piece-container">
                        {pieces.map((el, index) =>
                            <div key={index} className={`piece${inputs.some(row => row[0] == index) ? ' selected': ''}`} 
                                onClick={() => {
                                if(next == true) return;
                                if(inputs.some(row => row[0] == index)){
                                    setInputs(prev => prev.filter(row => row[0] != index));
                                }
                                else{
                                    setInputs(prev => [...prev, [index, el]]);
                                }
                                }}>{el}
                            </div>
                        )}
                    </div>
                    </>
                }
                <div id="foot-button-container">
                    <div id="foot-button" onClick={() => {if(count == null) return; if(count < testWords.length){setCount(prev => prev+1)}else{if(next){setCount(prev => prev+1); setNext(false)}else{check(); setNext(true)}}}}>{footButtonContent}</div>
                </div>
            </div>
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