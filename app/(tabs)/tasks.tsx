import React, { useState } from "react";
import { 
  Text, 
  View, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Platform, 
  SafeAreaView, 
  Alert, 
  TextInput, 
  KeyboardAvoidingView 
} from "react-native";
import { Image } from "expo-image";
import { usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useGameStore } from "../../store";
import type { TaskDifficulty } from "../../store";

export default function TasksScreen() {
  // Global State
  const { currentXp, tasks, toggleTask, addTask, theme } = useGameStore();
  const isLight = theme === 'light';
  const accent = isLight ? '#8000FF' : '#FF6500';
  const localStyles = getStyles(theme);
  
  // Local UI State
  const [taskName, setTaskName] = useState("");
  const [difficulty, setDifficulty] = useState<TaskDifficulty>("MEDIUM");

  const addNewTask = () => {
    if (taskName.trim().length === 0) {
      Alert.alert("INPUT_REQUIRED", "Objective title cannot be empty.");
      return;
    }
    
    const added = addTask(taskName, difficulty);
    if (added) {
      setTaskName("");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isLight ? '#FFFFFF' : '#050506' }}>
      <StatusBar style={isLight ? "dark" : "light"} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
        style={{ flex: 1 }}
      >
        <SafeAreaView style={localStyles.container}>
          
          <ScrollView 
            contentContainerStyle={localStyles.scrollContent} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Input Section */}
            <View style={localStyles.inputWrapper}>
              <TextInput
                style={localStyles.textInput}
                placeholder="ACCEPT A QUEST..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={taskName}
                onChangeText={setTaskName}
                autoCapitalize="characters"
              />
              <Pressable 
                style={({ pressed, hovered }) => [
                  localStyles.addButtonSmall,
                  pressed && { transform: [{ scale: 0.95 }] },
                  hovered && { opacity: 0.85 }
                ]} 
                onPress={addNewTask}
              >
                <Text style={localStyles.addButtonTextSmall}>EMBARK</Text>
              </Pressable>
            </View>

            {/* Difficulty Selector */}
            <View style={localStyles.difficultyRow}>
              {(["EASY", "MEDIUM", "HARD"] as TaskDifficulty[]).map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setDifficulty(option)}
                  style={({ pressed, hovered }) => [
                    localStyles.difficultyChip,
                    difficulty === option && localStyles.difficultyChipActive,
                    pressed && { transform: [{ scale: 0.95 }] },
                    hovered && difficulty !== option && { borderColor: accent, backgroundColor: isLight ? 'rgba(128, 0, 255, 0.05)' : 'rgba(255, 101, 0, 0.1)' }
                  ]}
                >
                  <Text
                    style={[
                      localStyles.difficultyText,
                      difficulty === option && localStyles.difficultyTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Task List */}
            {tasks.map((task) => (
              <Pressable 
                key={task.id} 
                onPress={() => toggleTask(task.id)}
                style={({ pressed, hovered }) => [
                  localStyles.taskCard, 
                  task.status === "COMPLETED" && { borderColor: 'rgba(0, 255, 150, 0.3)' },
                  pressed && { transform: [{ scale: 0.98 }] },
                  hovered && task.status !== "COMPLETED" && { borderColor: accent, shadowColor: accent, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 }
                ]}
              >
                <View style={localStyles.taskHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      localStyles.taskTitle,
                      task.status === "COMPLETED" && { color: '#00FF96', textDecorationLine: 'line-through' }
                    ]}>{task.title}</Text>
                    <Text style={localStyles.xpRewardText}>+{task.xpValue} XP REWARD</Text>
                  </View>
                  <View style={[
                    localStyles.priorityBadge, 
                    task.status === "COMPLETED" && { borderColor: '#00FF96' }
                  ]}>
                    <Text style={[
                      localStyles.priorityText, 
                      task.status === "COMPLETED" && { color: '#00FF96' }
                    ]}>{task.status === "COMPLETED" ? "CLEARED" : task.priority}</Text>
                  </View>
                </View>

                <View style={localStyles.progressBarContainer}>
                  <View style={[
                    localStyles.progressBarFill, 
                    { width: task.progress as any },
                    task.status === "COMPLETED" && { backgroundColor: '#00FF96' }
                  ]} />
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const getStyles = (theme: 'dark' | 'light') => {
  const isLight = theme === 'light';
  const primaryText = isLight ? '#000000' : '#FFFFFF';
  const accent = isLight ? '#8000FF' : '#FF6500';
  const bg = isLight ? '#FFFFFF' : '#050506';

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: bg },
    scrollContent: { padding: 20, paddingBottom: 20 },
    inputWrapper: { 
      flexDirection: 'row', 
      backgroundColor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', 
      borderRadius: 12, 
      borderWidth: 1, 
      borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', 
      marginBottom: 15, 
      paddingHorizontal: 12, 
      alignItems: 'center',
      height: 50
    },
    textInput: { flex: 1, color: primaryText, fontWeight: '700', fontSize: 13, letterSpacing: 1 },
    addButtonSmall: { backgroundColor: accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    addButtonTextSmall: { color: isLight ? '#FFFFFF' : '#000000', fontWeight: '900', fontSize: 10 },
    difficultyRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
    difficultyChip: { borderWidth: 1, borderColor: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)' },
    difficultyChipActive: { borderColor: accent, backgroundColor: isLight ? 'rgba(128, 0, 255, 0.1)' : 'rgba(255, 101, 0, 0.2)' },
    difficultyText: { color: isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    difficultyTextActive: { color: accent },
    taskCard: { backgroundColor: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255, 255, 255, 0.03)', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.08)' },
    taskHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    taskTitle: { color: primaryText, fontSize: 14, fontWeight: '800', letterSpacing: 1 },
    xpRewardText: { color: isLight ? 'rgba(128, 0, 255, 0.6)' : 'rgba(255, 101, 0, 0.6)', fontSize: 9, fontWeight: '900', marginTop: 4 },
    priorityBadge: { borderWidth: 1, borderColor: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    priorityText: { color: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '900' },
    progressBarContainer: { height: 4, backgroundColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: accent }
  });
};
