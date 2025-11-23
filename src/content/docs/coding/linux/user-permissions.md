---
title: User permissions
description: User permissions in Ubuntu, based on standard Linux principles, revolve around controlling who (User, Group, Others) can do what (read, write, execute) with files and directories. 
---

User permissions in Ubuntu, based on standard Linux principles, revolve around controlling who (User, Group, Others) can do what (read, write, execute) with files and directories. 

## Understanding Permissions
Every file and directory has permissions defined for three categories of users: 
- User (u): The owner of the file, typically the creator.
- Group (g): A collection of users who share the same access level to a file/directory.
- Others (o): All other users on the system not in the above two categories. 

There are three basic types of permissions, each with a symbolic and a numeric representation:

|Permission|Symbolic|Numeric|For Files|For Directories|
|-|-|-|-|-|
|Read|`r`|`4`|View contents|List contents (use `ls`)|
|Write|`w`|`2`|Modify/delete the file|Create/delete/rename files within the directory|
|Execute|`x`|`1`|Run the file as a program|Traverse into the directory (use `cd`)|

Permissions are viewed using the `ls -l` command, which displays a 10-character string (e.g., `-rwxr-xr--`). The first character indicates the file type (`-` for file, `d` for directory), and the next nine characters are the `rwx` permissions for the User, Group, and Others, respectively. 

## Key Commands for Management

Administrative tasks typically require the `sudo` command (superuser do), as the default user in Ubuntu has limited permissions.

- `chmod` (change mode): Modifies file and directory permissions. It can be used with numeric (octal) or symbolic notation.
    - Numeric example: `chmod 755 filename` sets permissions to rwxr-xr-x (full access for owner, read/execute for group and others).
     - Symbolic example: `chmod u+x filename` adds execute permission for the owner. chmod g-w filename removes write permission for the group.

- `chown` (change owner): Changes the user and/or group ownership of a file or directory.
    - Example: `sudo chown username:groupname` filename changes the owner and group.

- `adduser`: A user-friendly script for creating a new user account, prompting for information and creating a home directory.
    - Example: `sudo adduser newuser`
- `usermod`: Modifies an existing user's attributes, such as group membership.
    - Example: `sudo usermod -aG sudo username` adds a user to the sudo group, granting administrative privileges.
- `addgroup`: Creates a new security group.
    - Example: `sudo addgroup newgroup`


## Umask 

The umask (user file-creation mode mask) is a four-digit octal number that acts as a filter to restrict the default permissions of newly created files and directories. It defines which permission bits are turned off by default.

To understand umask, you must know the maximum possible permissions:
- Maximum for files: `666` (rw-rw-rw-)
- Maximum for directories: `777` (rwxrwxrwx)

The `umask` value is subtracted from the maximum permissions to determine the actual defaults. A common default umask is `0002` or `0022`.

|Value|Description|
|-|-|
|`0`|No permissions masked (kept)|
|`1`|Execute masked (removed)|
|`2`|Write masked (removed)|
|`4`|Read masked (removed)|

### Example using a common umask 0022:
- For a directory:
    - Maximum: 777
    - Umask: 022
    - Resulting permissions: 755 (rwxr-xr-x)
- For a file:
    - Maximum: 666
    - Umask: 022
    - Resulting permissions: 644 (rw-r--r--)

umask: View the current umask value.

umask 002: Temporarily set the umask for the current session.

## User groups
You can check user groups using the groups or id commands, and file/directory permissions using the `ls -l` or `stat` commands. 

### Commands
- `groups` : To check your own groups
    - To check another user's groups - `groups username`
- `id` : This command provides user and group IDs (UID and GID) as well as group names.
    - To check your own ID and groups - `id`
    - To check another user's ID and groups - `id username`
- `getent`: This command retrieves entries from system databases, including group information.
    - list all members of a specific group - `getent group sudo`
    - To list all groups for a specific user - `getent group | grep username`

#### User permissions
- `ls -l`: The most common way to view permissions in a long list format.
    - To view permissions of a specific file or directory: `ls -l filename_or_directory`
    - To view permissions of files in the current directory: `ls -l`
    - To view the permissions of a directory itself (not its contents), use the -d flag: `ls -ld directory_name`
- `stat`: Provides more detailed information, including access, modify, and change times.
    - To view detailed information for a file: `stat filename`
    - To view only the permission string and owner/group in a specific format: `stat --format "Permissions: %A, Owner: %U, Group: %G" filename`





## Best practices 

- Recursive Changes: Use the -R flag with chmod and chown to apply changes to all files and subdirectories, but be cautious of unintended consequences.
- Default Permissions (umask): The umask command can be used to set the default permissions for newly created files and directories.
- Manage Groups: Use groups to manage permissions efficiently for multiple users.

