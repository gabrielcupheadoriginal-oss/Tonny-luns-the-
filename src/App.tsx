import React, { useState, useEffect } from 'react';
import type { GameScreen, LevelConfig, GameSaveData } from './types/game.ts';
import { loadGameData, saveLevelResult } from './game/storage.ts';
import {
  createSkyLevel,
  createChapter1980Level,
  createChallengeLevel,
  createTutorialLevel,
  createClassicLevel,
} from './game/levelsData.ts';
import { TitleScreen } from './components/TitleScreen.tsx';
import { GameCanvas } from './components/GameCanvas.tsx';
import { Cinematic1980 } from './components/Cinematic1980.tsx';
import { ShopModal } from './components/ShopModal.tsx';
import { LevelSelectModal } from './components/LevelSelectModal.tsx';
import { ChallengeSelectModal } from './components/ChallengeSelectModal.tsx';
import { TutorialModal } from './components/TutorialModal.tsx';
import { VictoryModal } from './components/VictoryModal.tsx';
import { GameOverModal } from './components/GameOverModal.tsx';

export default function App() {
  const [saveData, setSaveData] = useState<GameSaveData>(() => loadGameData());
  const [screen, setScreen] = useState<GameScreen>('title');
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(() => createSkyLevel(101));

  // Modals
  const [showShop, setShowShop] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Victory / Defeat snapshot data
  const [endStats, setEndStats] = useState<{
    stars: number;
    coins: number;
    secrets: number;
    totalSecrets: number;
    progressPercent: number;
  }>({
    stars: 0,
    coins: 0,
    secrets: 0,
    totalSecrets: 2,
    progressPercent: 0,
  });

  // Testability & deep linking: support ?autostart=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      const lvl = params.get('level');
      if (lvl === '1980') {
        setCurrentLevel(createChapter1980Level());
      } else if (lvl) {
        const lvlNum = parseInt(lvl, 10);
        if (lvlNum >= 101 && lvlNum <= 110) {
          setCurrentLevel(createSkyLevel(lvlNum));
        } else {
          setCurrentLevel(createClassicLevel(lvlNum));
        }
      } else {
        setCurrentLevel(createSkyLevel(101));
      }
      setScreen('playing');
    }
  }, []);

  // Update document.body.dataset.state
  useEffect(() => {
    const bodyState =
      screen === 'playing'
        ? 'playing'
        : screen === 'gameover' || screen === 'victory'
        ? 'gameover'
        : 'title';
    document.body.dataset.state = bodyState;
  }, [screen]);

  // Handlers
  const handleStartCampaign = () => {
    setCurrentLevel(createSkyLevel(101));
    setScreen('playing');
  };

  const handleLaunchLevel = (lvlId: number | string) => {
    setShowLevelSelect(false);
    if (typeof lvlId === 'number') {
      if (lvlId >= 101 && lvlId <= 110) {
        setCurrentLevel(createSkyLevel(lvlId));
      } else {
        setCurrentLevel(createClassicLevel(lvlId));
      }
    } else if (lvlId === 'chase_1980') {
      setCurrentLevel(createChapter1980Level());
    }
    setScreen('playing');
  };

  const handleLaunchChallenge = (type: 'aereo' | 'dirigivel' | 'segredos' | 'tempestade') => {
    setShowChallenges(false);
    setCurrentLevel(createChallengeLevel(type));
    setScreen('playing');
  };

  const handleLaunchTutorial = () => {
    setShowTutorial(false);
    setCurrentLevel(createTutorialLevel());
    setScreen('playing');
  };

  const handleVictory = (stars: number, coinsEarned: number, secrets: number) => {
    saveLevelResult(currentLevel.id, stars, secrets, coinsEarned);
    const updated = loadGameData();
    setSaveData(updated);

    setEndStats({
      stars,
      coins: coinsEarned,
      secrets,
      totalSecrets: currentLevel.secretCount,
      progressPercent: 100,
    });
    setScreen('victory');
  };

  const handleGameOver = (progressPercent: number) => {
    setEndStats((prev) => ({
      ...prev,
      progressPercent,
    }));
    setScreen('gameover');
  };

  const handleNextLevel = () => {
    if (typeof currentLevel.id === 'number' && currentLevel.id >= 101 && currentLevel.id < 110) {
      const nextLvl = currentLevel.id + 1;
      setCurrentLevel(createSkyLevel(nextLvl));
      setScreen('playing');
    } else {
      setShowLevelSelect(true);
      setScreen('title');
    }
  };

  const handleRestartLevel = () => {
    if (typeof currentLevel.id === 'number') {
      if (currentLevel.id >= 101 && currentLevel.id <= 110) {
        setCurrentLevel(createSkyLevel(currentLevel.id));
      } else {
        setCurrentLevel(createClassicLevel(currentLevel.id));
      }
    } else if (currentLevel.id === 'chase_1980') {
      setCurrentLevel(createChapter1980Level());
    } else if (String(currentLevel.id).startsWith('challenge_')) {
      const type = String(currentLevel.id).replace('challenge_', '') as 'aereo' | 'dirigivel' | 'segredos' | 'tempestade';
      setCurrentLevel(createChallengeLevel(type));
    } else {
      setCurrentLevel(createTutorialLevel());
    }
    setScreen('playing');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Primary screen router */}
      {screen === 'title' && (
        <TitleScreen
          saveData={saveData}
          onStartCampaign={handleStartCampaign}
          onOpenCinematic1980={() => setScreen('cinematic_1980')}
          onOpenLevelSelect={() => setShowLevelSelect(true)}
          onOpenShop={() => setShowShop(true)}
          onOpenChallenges={() => setShowChallenges(true)}
          onOpenTutorial={() => setShowTutorial(true)}
        />
      )}

      {screen === 'cinematic_1980' && (
        <Cinematic1980
          onComplete={() => {
            setCurrentLevel(createChapter1980Level());
            setScreen('playing');
          }}
        />
      )}

      {screen === 'playing' && (
        <GameCanvas
          key={String(currentLevel.id)}
          levelConfig={currentLevel}
          saveData={saveData}
          onVictory={handleVictory}
          onGameOver={handleGameOver}
          onExitToMenu={() => setScreen('title')}
        />
      )}

      {/* Victory Modal */}
      {screen === 'victory' && (
        <VictoryModal
          levelTitle={currentLevel.title}
          isSpecial1980={currentLevel.id === 'chase_1980'}
          isFinalSkyBoss={currentLevel.id === 110}
          starsEarned={endStats.stars}
          coinsEarned={endStats.coins}
          secretsFound={endStats.secrets}
          totalSecrets={endStats.totalSecrets}
          onNextLevel={handleNextLevel}
          onRestart={handleRestartLevel}
          onReturnToMap={() => {
            setScreen('title');
            setShowLevelSelect(true);
          }}
        />
      )}

      {/* Game Over Modal */}
      {screen === 'gameover' && (
        <GameOverModal
          levelTitle={currentLevel.title}
          progressPercent={endStats.progressPercent}
          onRetry={handleRestartLevel}
          onReturnToMenu={() => setScreen('title')}
        />
      )}

      {/* Auxiliary Modals */}
      {showShop && (
        <ShopModal
          onClose={() => setShowShop(false)}
          onDataUpdated={(updated) => setSaveData(updated)}
        />
      )}

      {showLevelSelect && (
        <LevelSelectModal
          saveData={saveData}
          onSelectLevel={handleLaunchLevel}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {showChallenges && (
        <ChallengeSelectModal
          onSelectChallenge={handleLaunchChallenge}
          onClose={() => setShowChallenges(false)}
        />
      )}

      {showTutorial && (
        <TutorialModal
          onStartInteractive={handleLaunchTutorial}
          onClose={() => setShowTutorial(false)}
        />
      )}
    </div>
  );
}
