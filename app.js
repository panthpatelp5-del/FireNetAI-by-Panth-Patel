    const themeToggleIcon = document.getElementById('themeToggleIcon');
    const body = document.body;
    const moreIcon=document.querySelector(".more_icon");const chatMenuContainer=document.querySelector(".chat-menu-container");const dropdownMenu=document.getElementById("dropdownMenu");const clearChatButton=document.getElementById("clearChatButton");const newChatButton=document.getElementById("newChatButton");const toggleHistoryButton=document.getElementById("toggleHistoryButton");const historySidebar=document.getElementById("historySidebar");const messageInput=document.querySelector(".message-input");const chatBody=document.querySelector(".chat-body");const attachBtn=document.querySelector(".attach-icon");const imgwrap=document.querySelector(".pre-img-wrap");const preimg=document.querySelector(".pre-img");const historyList=document.getElementById("historyList");const deleteAllButton=document.getElementById("deleteAllButton"); // NEW
    const API_KEY="AIzaSyAm1TujIvO5I93kHE7MWvkVZ3lqYhx_zPA";const API_URL=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;const userdata={message:null,file:{data:null,mime_type:null}};let currentChatId=localStorage.getItem('currentChatId')||'chat-1';const CHAT_HISTORY_KEY='firenet_chat_history';const THEME_KEY = 'firenet_theme'; 
    const reader=new FileReader();const botAvatarSVG=`<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024"><path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path></svg>`;const welcomeMessageHTML=`${botAvatarSVG}<div class="message-text">Hey there 👋<br />Welcome to the grid. How can I help you today?</div>`;const getChatTitle=messages=>{const firstUserMessage=messages.find(m=>m.sender==='user');if(firstUserMessage)return firstUserMessage.text.substring(0,30)+(firstUserMessage.text.length>30?'...':'');return "New Chat";};
    
    // --- THEME LOGIC START ---
    const loadTheme = () => {
        const savedTheme = localStorage.getItem(THEME_KEY);
        // Default to dark mode if no preference is saved
        if (savedTheme === 'light-mode') {
            body.classList.add('light-mode');
            themeToggleIcon.innerText = 'light_mode';
        } else {
            body.classList.remove('light-mode');
            themeToggleIcon.innerText = 'dark_mode';
        }
    };

    const toggleTheme = () => {
        body.classList.toggle('light-mode');
        const isLightMode = body.classList.contains('light-mode');
        
        if (isLightMode) {
            localStorage.setItem(THEME_KEY, 'light-mode');
            themeToggleIcon.innerText = 'light_mode';
        } else {
            localStorage.setItem(THEME_KEY, 'dark-mode');
            themeToggleIcon.innerText = 'dark_mode';
        }
        // Immediately close dropdown menu when theme is toggled
        dropdownMenu.classList.remove('show');
    };

    themeToggleIcon.addEventListener('click', toggleTheme);
    loadTheme(); // Load the saved theme when the page loads
    // --- THEME LOGIC END ---

    const getChatHistory=()=>{try{const history=localStorage.getItem(CHAT_HISTORY_KEY);return history?JSON.parse(history):{};}catch(e){console.error("Error loading chat history:",e);return {};}};
    
    // NEW: Function to delete a specific chat by ID
    const deleteChat = (chatId) => {
        const history = getChatHistory();
        if (confirm(`Are you sure you want to delete chat: ${getChatTitle(history[chatId])}?`)) {
            delete history[chatId];
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
            
            // If the deleted chat was the currently active chat, start a new chat
            if (chatId === currentChatId) {
                startNewChat();
            } else {
                renderHistoryList();
            }
        }
    };
    
    // NEW: Function to delete ALL chats
    const deleteAllChats = () => {
        if (confirm("WARNING: This will delete ALL saved chat history permanently. Are you sure you want to proceed?")) {
            localStorage.removeItem(CHAT_HISTORY_KEY);
            startNewChat();
        }
    };

    const saveCurrentChat=()=>{
        const history=getChatHistory();
        const messages=[];
        chatBody.querySelectorAll('.message').forEach(messageEl=>{
            const isBot=messageEl.classList.contains('bot-message');
            const messageTextEl=messageEl.querySelector('.message-text');
            const attachmentEl=messageEl.querySelector('.attachment');
            if(messageTextEl){
                let text=messageTextEl.innerText;
                if(messageEl.classList.contains('thinking'))return;
                messages.push({sender:isBot?'bot':'user',text:text,attachment:attachmentEl?attachmentEl.outerHTML:null});
            }
        });
        if(messages.length>1){history[currentChatId]=messages;localStorage.setItem(CHAT_HISTORY_KEY,JSON.stringify(history));}
        else if(messages.length<=1&&currentChatId!=='chat-1'){delete history[currentChatId];localStorage.setItem(CHAT_HISTORY_KEY,JSON.stringify(history));}
    };
    const renderHistoryList=()=>{
        const history=getChatHistory();
        const chatIds=Object.keys(history).sort((a,b)=>{const timeA=parseInt(a.split('-')[1])||0;const timeB=parseInt(b.split('-')[1])||0;return timeB-timeA;});
        historyList.innerHTML='';
        if(chatIds.length===0){
            historyList.innerHTML='<div class="chat-item"><div class="chat-item-content"><div class="chat-item-title">No saved chats yet.</div></div></div>';
            return;
        }
        chatIds.forEach(id=>{
            const messages=history[id];
            const lastMessage=messages.length>1?messages[messages.length-1]:null;
            const title=getChatTitle(messages);
            const previewText=lastMessage?lastMessage.text||'...':'...';
            
            const chatItem=document.createElement('div');
            chatItem.classList.add('chat-item');
            if(id===currentChatId)chatItem.classList.add('active');
            chatItem.dataset.chatId=id;

            // NEW: Structure for content and delete icon
            const contentDiv = document.createElement('div');
            contentDiv.classList.add('chat-item-content');
            contentDiv.innerHTML=`<div class="chat-item-title">${title}</div><div class="chat-item-preview">${previewText}</div>`;
            
            const deleteIcon = document.createElement('span');
            deleteIcon.classList.add('material-symbols-outlined', 'delete-icon');
            deleteIcon.innerText = 'close'; 
            deleteIcon.title = 'Delete Chat';
            deleteIcon.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent loading the chat when deleting
                deleteChat(id);
            });

            chatItem.appendChild(contentDiv);
            chatItem.appendChild(deleteIcon);
            
            // Event listener for loading the chat (only on the content area click if possible, or main item)
            contentDiv.addEventListener('click',()=>loadChat(id));
            
            historyList.appendChild(chatItem);
        });
        // Correctly update button text
        toggleHistoryButton.innerText=historySidebar.classList.contains('active')?"Hide Chats":"View Chats";
    };
    const createMessage=(content,...classes)=>{const div=document.createElement("div");div.classList.add("message",...classes);div.innerHTML=content;return div;};
    const loadChatUI=(welcome=true)=>{
        chatBody.innerHTML='';
        if(welcome){const welcomeMessageDiv=createMessage(welcomeMessageHTML,"bot-message");chatBody.appendChild(welcomeMessageDiv);}
        chatBody.scrollTo({top:chatBody.scrollHeight,behavior:"smooth"});
        renderHistoryList();
        // Only hide sidebar if it's currently active (desktop/large screens)
        if(historySidebar.classList.contains('active') && window.innerWidth > 768){historySidebar.classList.remove('active');toggleHistoryButton.innerText="View Chats";}
        else if (historySidebar.classList.contains('active') && window.innerWidth <= 768){historySidebar.classList.remove('active');toggleHistoryButton.innerText="View Chats";}
    };
    const loadChat=id=>{
        if(id===currentChatId){dropdownMenu.classList.remove('show');return;}
        saveCurrentChat();
        const history=getChatHistory();
        const messages=history[id];
        if(!messages)return;
        currentChatId=id;
        localStorage.setItem('currentChatId',id);
        chatBody.innerHTML='';
        messages.forEach(msg=>{
            const content=`${msg.sender==='bot'?botAvatarSVG:''}${msg.attachment||''}<div class="message-text">${msg.text}</div>`;
            const classes=msg.sender==='bot'?["bot-message"]:["user-message"];
            const messageDiv=createMessage(content,...classes);
            chatBody.appendChild(messageDiv);
        });
        chatBody.scrollTo({top:chatBody.scrollHeight,behavior:"smooth"});
        renderHistoryList();
        dropdownMenu.classList.remove('show');
        // Hide sidebar after loading chat on small screens
        if(window.innerWidth<=768){historySidebar.classList.remove('active');toggleHistoryButton.innerText="View Chats";}
    };
    const startNewChat=()=>{saveCurrentChat();const newId='chat-'+Date.now();currentChatId=newId;localStorage.setItem('currentChatId',newId);loadChatUI();dropdownMenu.classList.remove('show');};
    const toggleHistory=()=>{historySidebar.classList.toggle('active');dropdownMenu.classList.remove('show');renderHistoryList();};
    const generatebotresponce=async(incomingMessageDiv,retryCount=0)=>{
        const messageEl=incomingMessageDiv.querySelector(".message-text");
        const showThinking=()=>{messageEl.innerHTML=`<div class="thinking-indicator"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;};
        showThinking();
        const parts=[{text:userdata.message}];
        if(userdata.file?.data){parts.unshift({inline_data:{data:userdata.file.data,mime_type:userdata.file.mime_type}});}
        const requestOptions={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:parts}]}),};
        try{
            const response=await fetch(API_URL,requestOptions);
            const Data=await response.json();
            if(!response.ok)throw new Error(Data.error?.message||"Unknown API error");
            const apiresponcetext=Data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/\*\*(.*?)\*\*/g,"$1")?.trim()||"⚠️ Empty response.";
            messageEl.innerText=apiresponcetext;
        }catch(error){
            attachBtn.style.display="flex";
            console.warn("Gemini API error:",error.message);
            if(retryCount<2){
                messageEl.innerHTML=`<div class="retry-message"><span>⚡ FireNetAI is busy... retrying (${retryCount+1}/3)</span><div class="thinking-indicator small"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>`;
                await new Promise(res=>setTimeout(res,2000));
                return generatebotresponce(incomingMessageDiv,retryCount+1);
            }
            messageEl.innerHTML=`<span style="color:#ff5555;"> 🔥 Sorry! FireNetAI servers are busy or unreachable.<br> Please try again in a few minutes. </span>`;
        }finally{
            incomingMessageDiv.classList.remove("thinking");
            chatBody.scrollTo({top:chatBody.scrollHeight,behavior:"smooth"});
            attachBtn.style.display="flex";
            saveCurrentChat();
            renderHistoryList();
        }
    };
    const handleUserMessage=e=>{
        if(e&&e.preventDefault)e.preventDefault();
        const userMessage=messageInput.value.trim();
        if(!userMessage&&!userdata.file.data)return;
        userdata.message=userMessage||"Analyze the attached image.";
        const messageContent=`${userdata.file.data?`<img src="data:${userdata.file.mime_type};base64,${userdata.file.data}" class="attachment" />`:""}<div class="message-text"></div>`;
        const outgoingMessageDiv=createMessage(messageContent,"user-message");
        outgoingMessageDiv.querySelector(".message-text").innerText=userdata.message;
        chatBody.appendChild(outgoingMessageDiv);
        messageInput.value="";
        messageInput.style.height="40px";
        chatBody.style.paddingBottom="70px";
        imgwrap.style.display="none";
        preimg.src="#";
        preimg.classList.remove("uploaded-file");
        userdata.file={data:null,mime_type:null};
        chatBody.scrollTo({top:chatBody.scrollHeight,behavior:"smooth"});
        setTimeout(()=>{const incomingMessageDiv=createMessage(`${botAvatarSVG}<div class="message-text"></div>`,"bot-message","thinking");chatBody.appendChild(incomingMessageDiv);generatebotresponce(incomingMessageDiv);},100);
    };
    document.querySelector('.chat-form').addEventListener('submit',handleUserMessage);
    messageInput.addEventListener("keypress",e=>{if(e.key==="Enter"&&!e.shiftKey){handleUserMessage(e);}});
    messageInput.addEventListener("input",()=>{messageInput.style.height="auto";messageInput.style.height=(messageInput.scrollHeight)+"px";});
    moreIcon.addEventListener("click",()=>{dropdownMenu.classList.toggle("show");});
    document.addEventListener("click",event=>{if(!chatMenuContainer.contains(event.target)){dropdownMenu.classList.remove("show");}});
    newChatButton.addEventListener('click',startNewChat);
    toggleHistoryButton.addEventListener('click',toggleHistory);
    // Bind new function to the "Delete All Chats" button
    deleteAllButton.addEventListener('click', deleteAllChats); 
    clearChatButton.addEventListener('click',()=>{
        if(confirm("Are you sure you want to clear the current chat history? This cannot be undone.")){
            const history=getChatHistory();
            delete history[currentChatId];
            localStorage.setItem(CHAT_HISTORY_KEY,JSON.stringify(history));
            startNewChat();
            dropdownMenu.classList.remove('show');
        }
    });
    attachBtn.addEventListener('click',()=>{
        const input=document.createElement('input');
        input.type='file';
        input.accept='image/*';
        input.onchange=e=>{
            const file = e.target.files[0];
            if (file) {
                reader.onloadend = () => {
                    // Extract Base64 part
                    const base64Data = reader.result.split(',')[1];
                    userdata.file.data = base64Data;
                    userdata.file.mime_type = file.type;

                    preimg.src = reader.result;
                    preimg.classList.add("uploaded-file");
                    imgwrap.style.display = "flex";
                    attachBtn.style.display = "none";
                    
                    messageInput.placeholder = "Analyze the image or add text...";
                    messageInput.focus();
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    });
    document.addEventListener('DOMContentLoaded', () => {
        if (!localStorage.getItem('currentChatId')) {
            startNewChat();
        } else {
            loadChat(currentChatId);
        }
        loadTheme();
    });