import { useState } from "react"
import { GptMessage, MyMessage, TypingLoader, TextMessageBoxfile } from "../../components";
import { audioToTextUseCase } from "../../../core/use-cases";

interface Message {
  text: string;
  isGpt: boolean;
}

export const AudioToTextPage = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handlePost = async (text: string, audioFile: File) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { text: text, isGpt: false }]);

    // USECASE
    // TODO: UseCase
    const resp = await audioToTextUseCase(audioFile, text);
    setIsLoading(false);
    if (!resp) return;
    // TODO: Añadir el mensaje de isGpt en true;
    const gptMessage = `
    ## Transcripción:
    __Duración__ ${Math.round(resp.duration)} segundos
    ### El texto es:
    ${resp.text}
    `;
    setMessages((prev) => [
      ...prev,
      { text: gptMessage, isGpt: true }
    ]);
    for (const segment of resp.segments) {
      const segmentMessage = `
      __ De ${Math.round(segment.start)} a ${Math.round(segment.end)} segundos.__
      ${segment.text}
      `
      setMessages((prev) => [
        ...prev,
        { text: segmentMessage, isGpt: true }
      ]);
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          {/* Bienvenido */}
          <GptMessage text="Hola, ¿Qué audio quieres generar hoy?" />

          {
            messages.map((message, index) => (
              message.isGpt
                ? (
                  <GptMessage key={index} text={message.text} />
                )
                : (
                  <MyMessage key={index} text={(message.text === '') ? 'Transcribe el audio a texto' : message.text} />
                )
            ))
          }

          {
            isLoading && (
              <div className="col-start-1 col-end-12 fade-in">
                <TypingLoader />
              </div>
            )
          }

        </div>
      </div>

      <TextMessageBoxfile onSendMessage={handlePost} placeholder="Escribe aqui lo que deseas" disableCorrections accept="audio/*" />
    </div>
  )
}
