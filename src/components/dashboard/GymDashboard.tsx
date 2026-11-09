import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

import { AnimatedToast } from "@/components/ui/AnimatedToast";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useGymDashboardData } from "@/hooks/useGymDashboardData";

import { AddExerciseModal } from "./catalog/AddExerciseModal";
import { CatalogSection } from "./catalog/CatalogSection";
import { ExerciseDetailModal } from "./catalog/ExerciseDetailModal";
import { DashboardHeader } from "./DashboardHeader";
import { dashboardStyles } from "./dashboardStyles";
import { DashboardTabBar } from "./DashboardTabBar";
import { AddEquipmentModal } from "./equipment/AddEquipmentModal";
import { EquipmentSection } from "./equipment/EquipmentSection";
import { ConfirmDeleteModal } from "./modals/ConfirmDeleteModal";
import { EditItemModal } from "./modals/EditItemModal";
import { ItemActionSheet } from "./modals/ItemActionSheet";
import { isExerciseCompatibleWithFocus } from "./muscleValidation";
import { ProfileSection } from "./profile/ProfileSection";
import { CreateRoutineCard } from "./routines/CreateRoutineCard";
import { RoutineCard } from "./routines/RoutineCard";
import { SelectExerciseModal } from "./routines/SelectExerciseModal";
import { MarcaFormCard } from "./tracking/MarcaFormCard";
import { MarcaHistoryList } from "./tracking/MarcaHistoryList";
import { RMTrackingChart } from "./tracking/RMTrackingChart";

/**
 * Vista principal del Dashboard del Gimnasio ("Apex Emerald Gym").
 * Arquitectura modularizada y desacoplada mediante `useGymDashboardData` y subcarpetas por dominio.
 */
export const GymDashboard: React.FC = () => {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const { user } = useAuth();

  const vm = useGymDashboardData();

  const currentRoutineObj = vm.routines.find(
    (r) => r.id === vm.trackingRoutineId,
  );
  const currentRoutineExercises = vm.getExercisesOfRoutine(currentRoutineObj);

  return (
    <View
      style={[
        dashboardStyles.mainWrapper,
        { backgroundColor: colors.background },
      ]}
    >
      {/* Cabecera superior con resumen y rol */}
      <DashboardHeader
        username={user?.username || "Atleta"}
        isAdmin={Boolean(user?.is_staff)}
        routinesCount={vm.routines.length}
        exercisesCount={vm.exercises.length}
        colors={colors}
      />

      {/* Barra de pestañas con iconos vectoriales */}
      <DashboardTabBar
        colors={colors}
        activeTab={vm.activeTab}
        onSelectTab={(tab) => {
          vm.setActiveTab(tab);
          if (tab === "catalog" || tab === "equipment") {
            vm.loadCatalogExtras();
          }
        }}
      />

      {vm.loading && (
        <View style={localStyles.loadingBar}>
          <ActivityIndicator color={colors.primary} size="small" />
        </View>
      )}

      <ScrollView
        style={dashboardStyles.scrollArea}
        contentContainerStyle={dashboardStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ==================== TAB 1: RUTINAS ==================== */}
        {vm.activeTab === "routines" && (
          <View style={dashboardStyles.sectionBlock}>
            <RMTrackingChart
              colors={colors}
              routines={vm.routines}
              trackingRoutineId={vm.trackingRoutineId}
              trackingExerciseId={vm.trackingExerciseId}
              marcaHistory={vm.marcaHistory}
              exercises={currentRoutineExercises}
              onSelectRoutine={vm.handleRoutineChangeInTracking}
              onSelectExercise={(exerciseId: string) => {
                vm.setTrackingExerciseId(exerciseId);
                vm.loadProgressionHistory(exerciseId);
              }}
            />

            <CreateRoutineCard
              colors={colors}
              newRoutineTitle={vm.newRoutineTitle}
              setNewRoutineTitle={vm.setNewRoutineTitle}
              newRoutineFocus={vm.newRoutineFocus}
              setNewRoutineFocus={vm.setNewRoutineFocus}
              selectedExercises={vm.exercises.filter(
                (ex) =>
                  vm.newRoutineExerciseIds.includes(ex.id) &&
                  isExerciseCompatibleWithFocus(ex, vm.newRoutineFocus),
              )}
              onOpenSelectExercises={() => vm.setShowNewRoutineModal(true)}
              onRemoveExercise={(id) =>
                vm.setNewRoutineExerciseIds((prev) =>
                  prev.filter((x) => x !== id),
                )
              }
              onCreate={vm.handleCreateRoutine}
            />

            {vm.routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                colors={colors}
                routine={routine}
                routineExercises={vm.getExercisesOfRoutine(routine)}
                exercises={vm.exercises}
                isAdding={vm.selectedRoutineForAdd === routine.id}
                selectedExToAdd={vm.selectedExToAdd}
                setSelectedExToAdd={vm.setSelectedExToAdd}
                selectedExsToAdd={vm.selectedExsToAdd}
                setSelectedExsToAdd={vm.setSelectedExsToAdd}
                setsCount={vm.setsCount}
                setSetsCount={vm.setSetsCount}
                minReps={vm.minReps}
                setMinReps={vm.setMinReps}
                maxReps={vm.maxReps}
                setMaxReps={vm.setMaxReps}
                onStartAdding={() => {
                  vm.setSelectedRoutineForAdd(routine.id);
                  const firstCompatible = vm.exercises.find((ex) =>
                    isExerciseCompatibleWithFocus(ex, routine.focus),
                  );
                  vm.setSelectedExToAdd(
                    firstCompatible ? firstCompatible.id : "",
                  );
                  vm.setSelectedExsToAdd(
                    firstCompatible ? [firstCompatible.id] : [],
                  );
                }}
                onCancelAdding={() => {
                  vm.setSelectedRoutineForAdd(null);
                  vm.setSelectedExsToAdd([]);
                  vm.setSelectedExToAdd("");
                }}
                onAddExercise={() => vm.handleAddExerciseToRoutine(routine.id)}
                onOptionsPress={() => vm.handleOpenRoutineOptions(routine)}
              />
            ))}
          </View>
        )}

        {/* ==================== TAB 2: PROGRESO / MARCAS ==================== */}
        {vm.activeTab === "tracking" && (
          <View style={dashboardStyles.sectionBlock}>
            <MarcaFormCard
              colors={colors}
              routines={vm.routines}
              trackingRoutineId={vm.trackingRoutineId}
              trackingExerciseId={vm.trackingExerciseId}
              currentRoutineExercises={currentRoutineExercises}
              onSelectRoutine={vm.handleRoutineChangeInTracking}
              onSelectExercise={(exerciseId: string) => {
                vm.setTrackingExerciseId(exerciseId);
                vm.loadProgressionHistory(exerciseId);
              }}
              marcaWeight={vm.marcaWeight}
              setMarcaWeight={vm.setMarcaWeight}
              marcaReps={vm.marcaReps}
              setMarcaReps={vm.setMarcaReps}
              marcaRpe={vm.marcaRpe}
              setMarcaRpe={vm.setMarcaRpe}
              savingMarca={vm.savingMarca}
              onSave={vm.handleSaveMarca}
              lastSavedSummary={vm.lastSavedSummary}
            />

            <MarcaHistoryList
              colors={colors}
              marcaHistory={vm.marcaHistory}
              onMarcaOptionsPress={vm.handleOpenMarcaOptions}
            />
          </View>
        )}

        {/* ==================== TAB 3: CATÁLOGO ==================== */}
        {vm.activeTab === "catalog" && (
          <CatalogSection
            colors={colors}
            exercises={vm.exercises}
            isStaff={user?.is_staff}
            onOpenAddExercise={() => {
              vm.loadCatalogExtras();
              vm.setShowAddExerciseModal(true);
            }}
            onOpenExerciseDetail={vm.openExerciseDetail}
            onExerciseOptionsPress={vm.handleOpenExerciseOptions}
          />
        )}

        {/* ==================== TAB 4: MÁQUINAS Y EQUIPOS ==================== */}
        {vm.activeTab === "equipment" && (
          <EquipmentSection
            colors={colors}
            equipmentList={vm.equipmentList}
            onOpenAddEquipment={() => vm.setShowAddEquipmentModal(true)}
            onEquipmentOptionsPress={vm.handleOpenEquipmentOptions}
          />
        )}

        {/* ==================== TAB 5: PERFIL / ADMIN ==================== */}
        {vm.activeTab === "profile" && (
          <ProfileSection
            colors={colors}
            showAdminUsers={vm.showAdminUsers}
            adminUsers={vm.adminUsers}
            onLoadAdminUsers={vm.loadAdminUsers}
          />
        )}
      </ScrollView>

      {/* ==================== MODALES GLOBALES ==================== */}
      <ExerciseDetailModal
        colors={colors}
        visible={vm.modalExerciseVisible}
        exercise={vm.selectedExercise}
        onClose={() => vm.setModalExerciseVisible(false)}
      />

      <SelectExerciseModal
        visible={vm.showNewRoutineModal}
        colors={colors}
        exercises={vm.exercises}
        routineFocus={vm.newRoutineFocus}
        selectedExerciseIds={vm.newRoutineExerciseIds}
        multiSelect={true}
        onConfirmSelection={(ids) => vm.setNewRoutineExerciseIds(ids)}
        onClose={() => vm.setShowNewRoutineModal(false)}
      />

      <AddExerciseModal
        colors={colors}
        visible={vm.showAddExerciseModal}
        newExName={vm.newExName}
        setNewExName={vm.setNewExName}
        newExVideo={vm.newExVideo}
        setNewExVideo={vm.setNewExVideo}
        newExInstructions={vm.newExInstructions}
        setNewExInstructions={vm.setNewExInstructions}
        equipmentList={vm.equipmentList}
        selectedEquipment={vm.newExEquipment}
        setSelectedEquipment={vm.setNewExEquipment}
        muscleList={vm.muscleList}
        selectedMuscle={vm.newExMuscle}
        setSelectedMuscle={vm.setNewExMuscle}
        onSubmit={vm.handleCreateExercise}
        onClose={() => vm.setShowAddExerciseModal(false)}
      />

      <AddEquipmentModal
        colors={colors}
        visible={vm.showAddEquipmentModal}
        onSubmit={vm.handleCreateEquipment}
        onClose={() => vm.setShowAddEquipmentModal(false)}
      />

      <ItemActionSheet
        visible={Boolean(vm.actionSheetItem)}
        colors={colors}
        itemType={vm.actionSheetItem?.type || "routine"}
        itemTitle={vm.actionSheetItem?.title || ""}
        itemSubtitle={vm.actionSheetItem?.subtitle}
        onEdit={() => {
          vm.setEditModalItem(vm.actionSheetItem);
          vm.setActionSheetItem(null);
        }}
        onDelete={() => {
          if (vm.actionSheetItem) {
            vm.setDeleteConfirmItem({
              type: vm.actionSheetItem.type,
              id: String(vm.actionSheetItem.data.id),
              title: vm.actionSheetItem.title,
            });
          }
          vm.setActionSheetItem(null);
        }}
        onClose={() => vm.setActionSheetItem(null)}
      />

      <EditItemModal
        visible={Boolean(vm.editModalItem)}
        colors={colors}
        itemType={vm.editModalItem?.type || "routine"}
        routineData={
          vm.editModalItem?.type === "routine" ? vm.editModalItem.data : null
        }
        exerciseData={
          vm.editModalItem?.type === "exercise"
            ? {
                id: vm.editModalItem.data.id,
                name: vm.editModalItem.data.name,
                equipment_id:
                  vm.editModalItem.data.equipment?.id ||
                  vm.editModalItem.data.equipment_id ||
                  null,
                instructions: vm.editModalItem.data.instructions || "",
                video_url:
                  vm.editModalItem.data.media?.[0]?.external_url ||
                  vm.editModalItem.data.video_url ||
                  "",
                muscle_id: vm.editModalItem.data.muscles?.[0]?.muscle || null,
              }
            : null
        }
        marcaData={
          vm.editModalItem?.type === "marca"
            ? {
                id: vm.editModalItem.data.id,
                weight: vm.editModalItem.data.weight,
                reps: vm.editModalItem.data.reps,
                rpe: vm.editModalItem.data.rpe,
              }
            : null
        }
        equipmentData={
          vm.editModalItem?.type === "equipment" ? vm.editModalItem.data : null
        }
        equipmentList={vm.equipmentList}
        muscleList={vm.muscleList}
        allExercises={vm.exercises}
        onSaveRoutine={vm.handleSaveRoutineEdit}
        onSaveExercise={vm.handleSaveExerciseEdit}
        onSaveMarca={vm.handleSaveMarcaEdit}
        onSaveEquipment={vm.handleSaveEquipmentEdit}
        onRemoveExerciseFromRoutine={vm.handleRemoveExerciseFromRoutine}
        onAddExerciseToRoutine={vm.handleAddExerciseToRoutineInEdit}
        onClose={() => vm.setEditModalItem(null)}
      />

      <ConfirmDeleteModal
        visible={Boolean(vm.deleteConfirmItem)}
        colors={colors}
        itemTitle={vm.deleteConfirmItem?.title || ""}
        itemType={vm.deleteConfirmItem?.type || "routine"}
        onConfirm={vm.handleConfirmDelete}
        onClose={() => vm.setDeleteConfirmItem(null)}
      />

      <AnimatedToast toast={vm.toast} onHide={vm.hideToast} />
    </View>
  );
};

const localStyles = StyleSheet.create({
  loadingBar: {
    paddingVertical: 4,
    alignItems: "center",
  },
});
