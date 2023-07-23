// TODO

// [ ] - Auto focus textinput in chat
// [ ] - 
// [ ] - 

const darkGreen = "rgb(38, 55, 51)";
const green = "rgb(41, 93, 78)";
 
import { View, Text, TouchableOpacity, TextInput, ScrollView, useWindowDimensions, Animated, Image } from "react-native";
import { Entypo } from '@expo/vector-icons';
import { useFonts } from "expo-font"
import { useEffect, useRef, useState } from "react";
import { TypingAnimation } from 'react-native-typing-animation';
import { Configuration, OpenAIApi } from "openai";
import { useHover } from "@react-native-aria/interactions";
import { authListener, defaultUser, fetchClient, signInWithEmail, signOut, signUpWithEmail } from "./supabaseConfig"

const AuthModal = ({ inOrUp, setShowModal }) => {

  const [isInOrUp, setIsInOrUp] = useState(inOrUp); // if true, sign in, else sign up
  const { height } = useWindowDimensions();
  const verticalAnim = useRef(new Animated.Value(-height / 1.5)).current;

  const popIn = () => {
    Animated.spring(verticalAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 10,
      speed: 6
    }).start()
  }
  const popOut = () => {
    Animated.timing(verticalAnim, {
      toValue: -height,
      useNativeDriver: true,
      duration: 500,
    }).start(() => setShowModal(false))
  }

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  return (
    <View onLayout={() => popIn()} style={{ height: "100vh", width: "100vw", position: "fixed", top: 0, left: 0, justifyContent: "center", alignItems: "center", zIndex: 2, backgroundColor: "rgba(0, 0, 0, 0.1)" }}>
      <Animated.View style={{
        // height: 200, 
        // width: 200, 
        padding: 20,
        backgroundColor: "white",
        transform: [{ translateY: verticalAnim }],
        borderRadius: 15,
        shadowColor: darkGreen,
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.4,
        shadowRadius: 7,
      }}>
        <TouchableOpacity onPress={() => popOut()} style={{ position: "absolute", top: 20, right: 20 }}>
          <Text>x</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 45, fontWeight: "bold", marginRight: 60, marginBottom: 20, color: darkGreen }}>{isInOrUp ? "Connection" : "Inscription"}</Text>

        <Text style={{ fontWeight: "bold", marginBottom: 10, color: darkGreen }} >Email</Text>
        <TextInput value={email} onChange={(e) => setEmail(e.nativeEvent.text)} style={{
          outline: "none",
          padding: 10,
          borderRadius: 10,
          shadowColor: darkGreen,
          shadowOffset: {
            width: 0,
            height: 0,
          },
          shadowOpacity: 0.4,
          shadowRadius: 7,
        }} placeholderTextColor={"gray"} placeholder="example@gmail.com" />

        <Text style={{ fontWeight: "bold", marginBottom: 10, marginTop: 15, color: darkGreen }} >Mot de passe</Text>
        <TextInput value={pwd} onChange={(e) => setPwd(e.nativeEvent.text)} style={{
          outline: "none",
          padding: 10,
          borderRadius: 10,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 0,
          },
          shadowOpacity: 0.4,
          shadowRadius: 7,
        }} secureTextEntry placeholderTextColor={"gray"} placeholder="Au minimum 6 charactères" onSubmitEditing={() => {
          if (isInOrUp) {
            signInWithEmail(email, pwd);
          } else {
            signUpWithEmail(email, pwd);
          }
          popOut()
        }} />

        <TouchableOpacity onPress={() => {
          if (isInOrUp) {
            signInWithEmail(email, pwd);
          } else {
            signUpWithEmail(email, pwd);
          }
          popOut()
        }} style={{ paddingVertical: 14, backgroundColor: "black", justifyContent: "center", alignItems: "center", backgroundColor: darkGreen, borderRadius: 10, marginTop: 20 }}>
          <Text style={{ color: "white", fontWeight: "bold" }}>{isInOrUp ? "Se connecter" : "S'inscrire"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 5 }} onPress={() => setIsInOrUp(!isInOrUp)}>
          <Text style={{ fontWeight: "bold", fontSize: 12, textAlign: "right", color: green }}>{isInOrUp ? "Pas encore de compte" : "Déjà un compte"}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

const TopBar = ({ setShowModal, setIsInOrUp, setType }) => {

  const [fontsLoaded] = useFonts({
    'Logo-Font': require('./assets/logo-font.otf'),
  });

  const [session, setSession] = useState();
  const [user, setUser] = useState(defaultUser);

  // add the auth listener (onAuthChanged)
  useEffect(() => {
    authListener(setSession)
  }, []);

  // get user data on session changed
  useEffect(() => {
    const gatherData = async () => {
      if (session.user) {
        setUser(await fetchClient(session.user.id))
      }
    }

    if (session) {
      gatherData();
    }
    console.log("session:", session)
  }, [session]);

  // checks if user need to add his name and lastname
  useEffect(() => {
    if (user.initialized == false) {
      alert("Ajoute un nom et un prénom")
    }
  }, [user])

  return (
    <View style={{ flexDirection: "row", padding: 15, width: "100vw", justifyContent: "space-between", paddingHorizontal: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity>
          <Text style={{ fontWeight: "bold", color: darkGreen }}>Trouver un praticien</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 20 }}>
          <Text style={{ fontWeight: "bold", color: darkGreen }}>Contact</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => setType("")}>
        <Text style={{ fontFamily: "Logo-font", fontSize: 50, paddingTop: 5, height: 50, color: darkGreen }}>Medi Est</Text>
      </TouchableOpacity>
      {
        (user && session) ?
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => signOut()}>
              <Text style={{ fontWeight: "bold", color: darkGreen }}>Se deconnecter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 12, backgroundColor: darkGreen, borderRadius: 10, marginLeft: 20 }}>
              <Text style={{ fontWeight: "bold", color: "white" }}>{user.name} {String(user.lastname).toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
          :
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => {
              setShowModal(true)
              setIsInOrUp(false)
            }}>
              <Text style={{ fontWeight: "bold", color: darkGreen }}>S'inscrire</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              setShowModal(true)
              setIsInOrUp(true)
            }} style={{ padding: 12, backgroundColor: darkGreen, borderRadius: 10, marginLeft: 20 }}>
              <Text style={{ fontWeight: "bold", color: "white" }}>Se connecter</Text>
            </TouchableOpacity>
          </View>
      }
    </View>
  )
}

const Message = ({ el, i, mess }) => {

  const scale = useRef(new Animated.Value(0)).current;

  const animScale = () => {
    Animated.spring(scale, {
      bounciness: 14,
      toValue: 1,
      speed: 3,
      useNativeDriver: true,
    }).start()
  }

  return (
    <Animated.View
      onLayout={() => {
        animScale();
      }}
      style={{ maxWidth: "80%", marginTop: 10, padding: el.type == 2 ? 0 : 10, borderRadius: 10, backgroundColor: el.type == 0 ? green : darkGreen, alignSelf: el.type == 0 ? "flex-end" : "flex-start", transform: [{ scale: scale }] }}>
      {el.type == 2 && i == mess.length - 1 &&
        <View style={{ width: 50, height: 40, borderRadius: 10, backgroundColor: darkGreen }}>
          <TypingAnimation
            dotColor={"white"}
            dotMargin={5}
            dotAmplitude={3}
            dotSpeed={0.15}
            dotRadius={4}
            dotX={12}
            dotY={8}
            style={{ position: "absolute", top: 10, left: 10 }}
          />
        </View>
      }
      <Text style={{ fontWeight: "500", color: "white" }}>{el.content}</Text>
    </Animated.View>
  )
}

const SearchArea = ({ chat, setChat, setType }) => {

  const [query, setQuery] = useState("");
  const { height } = useWindowDimensions()
  const [h, setH] = useState(height - 15 - 15 - 50);

  const [mess, setMess] = useState([]);
  const [openai, setOpenai] = useState();

  const [loading, setLoading] = useState(false);

  const summarizeChat = async () => {
    var c = chat;
    c.slice(c.length).slice(1)
    console.log(c)
    const prompt = "You have to summarize a chat between the user and the assistant. The text you'll provide will be used by a doctor so only talk about the user problems. You have to summarize in the chat language. Explain all the symptoms of the user. The summarize text should be in a perfect french ad very precize. No more than 4 sentences. Here is the chat: " + JSON.stringify(c)

    const summarize = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 1,
      max_tokens: 1000,
    })

    console.log(summarize.data.choices[0].text)
  }

  useEffect(() => {

    const gatherResponse = async () => {
      setMess((old) => [...old, { type: 2, content: "" }])

      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: chat
      });
      const resp = response.data.choices[0].message.content;

      if (resp.includes("*2*") || resp.includes("généraliste")) {
        setType("Généraliste")
        summarizeChat()
      } else if (resp.includes("*1*") || resp.includes("dentiste")) {
        setType("Dentiste")
        summarizeChat()
      } else if (resp.includes("*3*") || resp.includes("psychologue")) {
        setType("Psychologue")
        summarizeChat()
      } else if (resp.includes("*4*") || resp.includes("ostéopathe")) {
        setType("Ostéopathe")
        summarizeChat()
      } else if (resp.includes("medecin") || resp.includes("docteur") || resp.includes("médecin") || resp.includes("général") || resp.includes("neurologue") || resp.includes("chez vous")) {
        setType("Généraliste")
        summarizeChat()
      } else if (resp.includes("*0*") || resp.includes("urgence")) {
        alert("Veuillez vous rendre à l'hopital le plus proche ou appeler le 15 !")        
      }
      setChat((old) => [...old, {
        "role": "assistant",
        "content": resp
      }])      

      setMess((old) => [...old, { type: 1, content: resp }])
      setLoading(false);
    }

    if (mess.length != 0 && mess[mess.length - 1].type == 0) {
      gatherResponse();
    }
  }, [chat])


  useEffect(() => {
    const configuration = new Configuration({
      apiKey: "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"
    });
    setOpenai(new OpenAIApi(configuration))
  }, [])

  useEffect(() => {

    if (mess.length != 0 && mess[mess.length - 1].type == 0) {
      setLoading(true)
      setChat((old) => [...old, {
        "role": "user",
        "content": mess[mess.length - 1].content,
      }])
    }

  }, [mess.length])

  const textOpacity = useRef(new Animated.Value(1)).current;
  const hideText = () => {
    Animated.timing(textOpacity, {
      duration: 800,
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      setMess((old) => [...old, { type: 0, content: query }])
    })
  }

  const messScrollRef = useRef(null)

  return (
    <View style={{ width: "100vw", alignItems: "center", minHeight: h, paddingTop: textOpacity._value == 0 ? 0 : 0.25 * height }}>
      {textOpacity._value != 0 && <Animated.Text style={{ fontSize: 45, textAlign: "center", fontWeight: "bold", opacity: textOpacity, color: darkGreen }}>{`Decrivez vos symptomes,\nTrouvez le praticien qui vous correspond.`}</Animated.Text>}
      {textOpacity._value == 0 && <ScrollView onContentSizeChange={() => messScrollRef.current.scrollToEnd({ animated: true })} ref={messScrollRef} style={{
        minWidth: 400,
        maxWidth: 600,
        width: "50vw",
        marginTop: 50,
        paddingHorizontal: 15,
        paddingBottom: 10,
        height: textOpacity._value == 0 ? "calc(100vh - 80px - 77px - 100px)" : null // top bar (80px) | search bar (57px + 20px de margin)
      }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-end',
        }}
      >
        {
          mess.map((el, i) => {
            return <Message key={i} el={el} i={i} mess={mess} />
          })
        }
      </ScrollView>}
      <View style={{ flexDirection: "row", marginTop: 50 }}>
        <Entypo name="magnifying-glass" size={26} color={green} style={{ position: "absolute", top: 14, left: 14 }} />
        <TextInput
          editable={!loading}
          placeholder="Resumez en quelques mots..."
          value={query}
          onChange={(e) => setQuery(e.nativeEvent.text)}
          placeholderTextColor={darkGreen}
          style={{
            marginBottom: 20,
            outline: "none",
            padding: 20,
            paddingLeft: 20 + 30,
            borderRadius: 20,
            minWidth: 400,
            maxWidth: 600,
            width: "50vw",
            // shadowColor: "#000",
            shadowColor: darkGreen,
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: 0.4,
            shadowRadius: 7,
            fontWeight: "500"
          }}
          onSubmitEditing={() => {
            if (textOpacity._value == 1) {
              setQuery("");
              hideText();
            } else {
              setQuery("");
              setMess((old) => [...old, { type: 0, content: query }])
            }
            // setH((old) => old+500)
          }}
        />
      </View>
    </View>
  )
}

const Card = ({ type }) => {

  const ref = useRef()
  const { isHovered, hoverProps } = useHover({}, ref);

  const scale = useRef(new Animated.Value(1)).current;

  const [data, setData] = useState({ name: "", lastname: "" })

  useEffect(() => {
    fetch("https://api.parser.name/?api_key=93d471ea85d1937e713e8aafffb32090&endpoint=generate&country_code=FR")
      .then((data) => data.json())
      .then((data) => {
        const name = data.data[0].name.firstname.name
        const lastname = data.data[0].name.lastname.name
        setData({ name, lastname })
      })
      .catch((err) => console.log("err", err))
  }, [])

  const animIn = () => {
    Animated.spring(scale, {
      toValue: 1.05,
      bounciness: 10,
      speed: 15
    }).start()
  }
  const animOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      bounciness: 10,
      speed: 15
    }).start()
  }
  useEffect(() => {
    if (isHovered) {
      animIn()
    } else {
      animOut()
    }
  }, [isHovered])

  const [rdm, setRdm] = useState((Math.random() * (15 - 0.5 + 1) + 0.5))

  return (
    <Animated.View ref={ref} style={{
      transform: [{ scale: scale }],
      minHeight: 200,
      width: 250,
    }} {...hoverProps}>
      <TouchableOpacity onPress={() => setClicked(true)} style={{
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 15,
        shadowColor: darkGreen,
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.4,
        shadowRadius: 7,
        padding: 20
      }} >
        <Text style={{ position: "absolute", top: 10, right: 10, fontWeight: "300", color: green }}>{Number(rdm).toFixed(1)} km</Text>
        <Image source={{ uri: "https://source.boringavatars.com/" }} style={{ height: 100, width: 100 }} />
        <Text style={{ marginTop: 20, fontSize: 16, fontWeight: "bold", color: darkGreen, marginBottom: 10 }}>Dr. {String(data.lastname).toUpperCase()} {data.name}</Text>
        <Text style={{ color: darkGreen }}>{type}</Text>
        <Text style={{ color: darkGreen }}>5 rue Colbert, Troyes</Text>
        <Text style={{ color: darkGreen }}>+33 640198396</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const CardList = ({ type }) => {
  return (
    <View style={{ marginTop: 100 }}>
      <Text style={{ marginBottom: 50, marginLeft: 40, fontWeight: "bold", fontSize: 26, color: darkGreen }}>Les {type}s proches de vous</Text>
      {
        [0, 1].map((el, i) => {
          return (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 50 }}>
              {
                [0, 1, 2, 3].map((el2, j) => {
                  return <Card type={type} key={String(i) + String(j)} />;
                })
              }
            </View>
          )
        })
      }
    </View>
  )
}

const App = () => {

  const [chat, setChat] = useState([{
    "role": "system", "content":
    `You have to answer in the question language. 
You are an AI Health Assistant. 
You help users to find an health professional. 
You have to find what kind of doctor the user should see.
 All the doctor's types are listed bellow it cannot be something else, only respond with the corresponding number. 
 Do not say "are you looking for the X of doctor". 
 You have to ask question to find the best one for the user. 
 Ask your questions to precisely know what's wrong. 
 Ask 1 question per message. 
 Each question cost 1 credit. 
 You have a total of 4 credits. 
 Never ask more than 4 questions in total.
 Use all your credit before giving the final answer. 
 If the message contains vulgar words, ask a question. 
 If you think a word is miss-spelled do not hesitate to ask the user to write it again but if eveything is correctly written and you hesitate a lot, answer : (*2*). 
 You can't answer anything else than health-related questions. 
 If it seems just a little bit related to anxiety, stress or mental health problem, answer : '(*3*)'.                 

Desired format once doctor found : (*<number of the answer>*)
If the specialist you want to answer isn't in the follwoing list, answer : '(*2*)'.
Only answer in the 0 - 4 range.
If you think it's an emergency : '(*0*)', 
if it's a dentist : '(*1*)', 
if it's a generalist : '(*2*)', 
if it's a psychologist : '(*3*)', 
if it's an osteopath : '(*4*)'.
  `}])

  const [type, setType] = useState("");
  const [showSignModal, setShowSignModal] = useState(false);
  const [isInOrUp, setIsInOrUp] = useState(false);

  return (
    <ScrollView style={{ height: "100vh" }}>
      {
        showSignModal && <AuthModal setShowModal={setShowSignModal} inOrUp={isInOrUp} />
      }
      <TopBar setShowModal={setShowSignModal} setIsInOrUp={setIsInOrUp} setType={setType} />
      {
        type == "" ?
          <SearchArea chat={chat} setChat={setChat} setType={setType} />
          :
          <CardList type={type} />
      }
    </ScrollView>
  )
}

export default App;