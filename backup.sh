#!/bin/bash

# 📁 Percorso progetto
PROJECT_DIR="$HOME/Documents/scriptforge-next"

# 📁 Directory di destinazione backup
BACKUP_DIR="$HOME/Backups/scriptforge"

# 📅 Data e ora attuale
DATE=$(date +"%Y-%m-%d_%H-%M-%S")

# 📦 Nome archivio
ARCHIVE_NAME="backup_scriptforge_$DATE.tar.gz"

# 🛠️ Crea cartella backup se non esiste
mkdir -p "$BACKUP_DIR"

# 🎯 Crea l'archivio, escludendo cartelle inutili
tar --exclude='.next' --exclude='node_modules' -czf "$BACKUP_DIR/$ARCHIVE_NAME" -C "$PROJECT_DIR" .

echo "✅ Backup completato: $ARCHIVE_NAME"

# Notifica su macOS al termine del backup
osascript -e 'display notification "Backup completato con successo!" with title "ScriptForge AI - Backup" sound name "Submarine"'

0 20 */2 * * /Users/williamcasotto/Documents/scriptforge-next/backup.sh || osascript -e 'display notification "Il backup non è riuscito." with title "ScriptForge AI - Errore" sound name "Funk"'
